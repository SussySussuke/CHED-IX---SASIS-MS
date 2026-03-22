<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

abstract class BaseParser
{
    /** Machine-readable tag in cell A1, e.g. [ANNEX_A] */
    abstract public function sheetId(): string;

    /** Human-readable name for error messages */
    abstract public function label(): string;

    /**
     * Parse the worksheet and return a ParseResult.
     * Errors are row-level: { row, field, message }
     */
    abstract public function parse(Worksheet $ws): ParseResult;

    // ── shared helpers ─────────────────────────────────────────────────────

    protected function cell(Worksheet $ws, int $row, int $col): mixed
    {
        return $ws->getCellByColumnAndRow($col, $row)->getValue();
    }

    protected function str(Worksheet $ws, int $row, int $col): ?string
    {
        $v = $this->cell($ws, $row, $col);
        if ($v === null || $v === '') return null;
        return mb_substr(trim((string) $v), 0, 255) ?: null;
    }

    protected function longStr(Worksheet $ws, int $row, int $col): ?string
    {
        $v = $this->cell($ws, $row, $col);
        if ($v === null || $v === '') return null;
        return trim((string) $v) ?: null;
    }

    protected function int_(Worksheet $ws, int $row, int $col): int
    {
        $v = $this->cell($ws, $row, $col);
        return is_numeric($v) ? (int) $v : 0;
    }

    protected function bool_(Worksheet $ws, int $row, int $col): bool
    {
        $v = strtolower(trim((string) $this->cell($ws, $row, $col)));
        return in_array($v, ['yes', '1', 'true', 'y'], true);
    }

    protected function date_(Worksheet $ws, int $row, int $col): ?string
    {
        $v = $this->cell($ws, $row, $col);
        if ($v === null || $v === '') return null;

        // PhpSpreadsheet may return a float (Excel serial date)
        if (is_numeric($v)) {
            try {
                $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $v);
                return $date->format('Y-m-d');
            } catch (\Throwable) {
                return null;
            }
        }

        foreach (['Y-m-d', 'm/d/Y', 'd-m-Y', 'Y/m/d', 'd/m/Y'] as $fmt) {
            $d = \DateTime::createFromFormat($fmt, trim((string) $v));
            if ($d) return $d->format('Y-m-d');
        }

        return null;
    }

    protected function isRowBlank(Worksheet $ws, int $row, int $startCol, int $endCol): bool
    {
        for ($c = $startCol; $c <= $endCol; $c++) {
            $v = $this->cell($ws, $row, $c);
            if ($v !== null && trim((string) $v) !== '') return false;
        }
        return true;
    }
}
