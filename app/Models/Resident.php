<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resident extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'appartement_id',
        'full_name',
        'email',
        'phone',
        'entry_date',
        'monthly_charge',
    ];

    protected function casts(): array
    {
        return [
            'monthly_charge' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appartement(): BelongsTo
    {
        return $this->belongsTo(Appartement::class, 'appartement_id');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'resident_id');
    }

    public function paiementsPayes(): HasMany
    {
        return $this->paiements()->where('statut', 'payé');
    }
}
