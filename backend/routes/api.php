<?php

use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'message' => 'Smart Labirintus API működik!'
    ]);
});