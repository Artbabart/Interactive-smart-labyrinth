<?php

use App\Models\Child;
use App\Models\GameResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| API TESZT
|--------------------------------------------------------------------------
*/

Route::get('/test', function () {

    return response()->json([
        'message' => 'Smart Labirintus API működik!'
    ]);

});


/*
|--------------------------------------------------------------------------
| GYEREKEK
|--------------------------------------------------------------------------
*/

Route::get('/children', function () {

    $children = Child::orderBy('name')
        ->get();

    return response()->json([
        'children' => $children
    ]);

});


Route::post('/children', function (Request $request) {

    $validated = $request->validate([
        'name' => [
            'required',
            'string',
            'max:100'
        ],
    ]);


    $child = Child::create([
        'name' => $validated['name'],
    ]);


    return response()->json([
        'message' => 'Gyerek sikeresen hozzáadva.',
        'child' => $child,
    ], 201);

});


/*
|--------------------------------------------------------------------------
| EREDMÉNYEK
|--------------------------------------------------------------------------
*/

Route::get('/results', function () {

    $results = GameResult::orderBy(
        'created_at',
        'desc'
    )->get();


    return response()->json([
        'results' => $results
    ]);

});


Route::post('/results', function (Request $request) {

    $validated = $request->validate([

        'childId' => [
            'required',
            'integer'
        ],

        'childName' => [
            'required',
            'string'
        ],

        'levelId' => [
            'required',
            'integer'
        ],

        'levelName' => [
            'required',
            'string'
        ],

        'difficulty' => [
            'required',
            'string'
        ],

        'steps' => [
            'required',
            'integer',
            'min:0'
        ],

        'mistakes' => [
            'required',
            'integer',
            'min:0'
        ],

        'timeSeconds' => [
            'required',
            'integer',
            'min:0'
        ],

        'completed' => [
            'required',
            'boolean'
        ],

    ]);


    $result = GameResult::create([

        'child_id' =>
            $validated['childId'],

        'child_name' =>
            $validated['childName'],

        'level_id' =>
            $validated['levelId'],

        'level_name' =>
            $validated['levelName'],

        'difficulty' =>
            $validated['difficulty'],

        'steps' =>
            $validated['steps'],

        'mistakes' =>
            $validated['mistakes'],

        'time_seconds' =>
            $validated['timeSeconds'],

        'completed' =>
            $validated['completed'],

    ]);


    return response()->json([

        'message' =>
            'Eredmény sikeresen mentve.',

        'result' =>
            $result,

    ], 201);

});