"""Explainable, conservative extraction of common receipt fields."""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from datetime import date
from decimal import Decimal, InvalidOperation

_DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
_AMOUNT = re.compile(r"(?<![\w])(?:₹|INR\s*|Rs\.?\s*|रु\.?\s*)?([0-9][0-9,]*(?:\.[0-9]{1,2})?)(?!\w)", re.IGNORECASE)
_TOTAL_LABELS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("grand_total", re.compile(r"\b(?:grand\s+total|g\.?\s*total|total\s+payable|amount\s+payable|net\s+amount|balance\s+due)\b|देय\s+राशि", re.IGNORECASE)),
    ("total", re.compile(r"\btotal\b|कुल(?:\s+राशि)?", re.IGNORECASE)),
)
_EXCLUDED_AMOUNT_CONTEXT = re.compile(
    r"\b(?:sub\s*total|subtotal|tax|gst|cgst|sgst|igst|discount|change|cash\s+tendered|round\s*off)\b",
    re.IGNORECASE,
)
_DATE_PATTERNS = (
    re.compile(r"\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b"),
    re.compile(r"\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b"),
    re.compile(r"\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})\b"),
)


@dataclass(frozen=True)
class CandidateFields:
    merchant: str | None = None
    expense_date: date | None = None
    amount: Decimal | None = None
    currency: str | None = None
    amount_confidence: str = "missing"
    warnings: tuple[str, ...] = ()

    def as_dict(self) -> dict[str, object]:
        result = asdict(self)
        result["expense_date"] = self.expense_date.isoformat() if self.expense_date else None
        result["amount"] = str(self.amount) if self.amount is not None else None
        result["warnings"] = list(self.warnings)
        return result


def _parse_amount(value: str) -> Decimal | None:
    normalized = value.translate(_DEVANAGARI_DIGITS)
    if "," in normalized and "." not in normalized:
        trailing = len(normalized.rsplit(",", 1)[1])
        if trailing == 2:
            normalized = normalized.replace(",", ".")
        else:
            normalized = normalized.replace(",", "")
    else:
        normalized = normalized.replace(",", "")
    try:
        amount = Decimal(normalized)
    except InvalidOperation:
        return None
    return amount if amount > 0 else None


def _extract_dates(text: str) -> list[date]:
    normalized = text.translate(_DEVANAGARI_DIGITS)
    candidates: list[date] = []
    for index, pattern in enumerate(_DATE_PATTERNS):
        for match in pattern.finditer(normalized):
            parts = [int(item) for item in match.groups()]
            if index == 0:
                year, month, day = parts
            else:
                day, month, year = parts
                if index == 2:
                    year += 2000 if year < 50 else 1900
            try:
                candidate = date(year, month, day)
            except ValueError:
                continue
            if candidate not in candidates:
                candidates.append(candidate)
    return candidates


def extract_receipt_fields(
    text: str,
    *,
    amount_context_lines: list[str] | None = None,
) -> CandidateFields:
    """Extract only labeled totals; leave unlabelled or conflicting amounts unresolved."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    merchant = next(
        (line[:255] for line in lines[:5] if re.search(r"[A-Za-z\u0900-\u097F]", line)),
        None,
    )
    normalized_lines = [line.translate(_DEVANAGARI_DIGITS) for line in lines]
    date_candidates = _extract_dates("\n".join(normalized_lines))
    date_candidate = date_candidates[0] if date_candidates else None
    labeled_date_count = sum(len(re.findall(r"\bdate\b", line, re.IGNORECASE)) for line in normalized_lines)

    selected: list[tuple[str, Decimal, str]] = []
    for line in amount_context_lines if amount_context_lines is not None else normalized_lines:
        line = line.translate(_DEVANAGARI_DIGITS)
        if _EXCLUDED_AMOUNT_CONTEXT.search(line):
            continue
        label = next((name for name, pattern in _TOTAL_LABELS if pattern.search(line)), None)
        if not label:
            continue
        for match in _AMOUNT.finditer(line):
            amount = _parse_amount(match.group(1))
            if amount is not None:
                selected.append((label, amount, line))

    warnings: list[str] = []
    amount: Decimal | None = None
    confidence = "missing"
    currency: str | None = None
    if selected:
        best_label = "grand_total" if any(row[0] == "grand_total" for row in selected) else "total"
        best = [row for row in selected if row[0] == best_label]
        distinct = {row[1] for row in best}
        if len(distinct) == 1:
            amount = best[0][1]
            confidence = "candidate"
            currency = "INR" if any(
                "₹" in row[2] or re.search(r"\bINR\b|\bRs\.?\b|रु(?:\.|पये)?", row[2], re.IGNORECASE)
                for row in best
            ) else None
        else:
            warnings.append("Several different labeled totals were found; choose the correct amount manually.")
            confidence = "ambiguous"
    else:
        warnings.append("No clearly labeled payable total was found; enter the amount manually.")

    if date_candidate is None:
        warnings.append("No valid transaction date was found; enter it manually.")
    elif len(date_candidates) > 1 or labeled_date_count > len(date_candidates):
        warnings.append("Several receipt dates were found; verify that the selected date is the transaction date.")
    if merchant is None:
        warnings.append("No merchant name was found; enter it manually.")
    return CandidateFields(merchant, date_candidate, amount, currency, confidence, tuple(warnings))
