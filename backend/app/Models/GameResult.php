<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameResult extends Model
{
    protected $fillable = [
        'child_id',
        'child_name',
        'level_id',
        'level_name',
        'difficulty',
        'steps',
        'mistakes',
        'time_seconds',
        'completed',
    ];
}