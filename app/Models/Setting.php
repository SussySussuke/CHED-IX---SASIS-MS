<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key
     */
    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value by key
     */
    public static function set($key, $value)
    {
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Get the annual submission deadline for current year
     * Stored as full datetime, but uses current year (year-agnostic)
     */
    public static function getDeadline()
    {
        $deadline = self::get('annual_submission_deadline');
        if (!$deadline) {
            return null;
        }

        // Extract month-day-time from stored deadline, apply current year
        $currentYear = date('Y');
        $dateTime = new \DateTime($deadline);
        $monthDay = $dateTime->format('m-d H:i:s');
        $fullDeadline = $currentYear . '-' . $monthDay;

        return new \DateTime($fullDeadline);
    }

    /**
     * Check if current date is past the deadline
     */
    public static function isPastDeadline()
    {
        $deadline = self::getDeadline();
        if (!$deadline) {
            return false;
        }
        return new \DateTime() > $deadline;
    }
}
