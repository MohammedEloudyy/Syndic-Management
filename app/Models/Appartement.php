<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appartement extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'immeuble_id',
        'number',
        'floor',
        'surface',
        'rooms',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'floor' => 'integer',
            'surface' => 'integer',
            'rooms' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function immeuble(): BelongsTo
    {
        return $this->belongsTo(Immeuble::class, 'immeuble_id');
    }

    public function residents(): HasMany
    {
        return $this->hasMany(Resident::class, 'appartement_id');
    }
}
