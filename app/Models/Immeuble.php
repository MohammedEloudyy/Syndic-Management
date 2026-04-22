<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Immeuble extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'name',
        'address',
        'city',
        'apartment_count',
    ];

    protected function casts(): array
    {
        return [
            'apartment_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appartements(): HasMany
    {
        return $this->hasMany(Appartement::class, 'immeuble_id');
    }

    public function depenses(): HasMany
    {
        return $this->hasMany(Depense::class, 'immeuble_id');
    }
}
