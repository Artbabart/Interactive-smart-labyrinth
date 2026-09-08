<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_results', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('child_id');
            $table->string('child_name');

            $table->unsignedBigInteger('level_id');
            $table->string('level_name');
            $table->string('difficulty');

            $table->unsignedInteger('steps');
            $table->unsignedInteger('mistakes');
            $table->unsignedInteger('time_seconds');

            $table->boolean('completed');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_results');
    }
};