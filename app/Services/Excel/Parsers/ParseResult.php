<?php

namespace App\Services\Excel\Parsers;

/**
 * Returned by every parser. Immutable after construction.
 */
final class ParseResult
{
    public function __construct(
        /** The sheet identifier tag, e.g. 'ANNEX_A' */
        public readonly string $sheetId,
        /** Human-readable label */
        public readonly string $label,
        /** Parsed payload ready to feed into the relevant store() method */
        public readonly array $payload,
        /** Row-level errors: [['row' => int, 'field' => string, 'message' => string]] */
        public readonly array $errors,
        /** True if the sheet had no user-fillable data at all */
        public readonly bool $isEmpty,
    ) {}

    public function hasErrors(): bool
    {
        return count($this->errors) > 0;
    }
}
