<?php

namespace Database\Factories;

use App\Models\HEI;
use Illuminate\Database\Eloquent\Factories\Factory;

class HEIFactory extends Factory
{
    protected $model = HEI::class;

    private static array $privateNames = [
        'Saint Jude College', 'Holy Angel University',
        'Lyceum of the Philippines University', 'Far Eastern University',
        'San Beda University', 'Mapúa University', 'AMA Computer University',
        'Philippine Christian University', 'Centro Escolar University',
        'Arellano University',
    ];

    private static array $sucNames = [
        'Batangas State University', 'Cavite State University',
        'Laguna State Polytechnic University', 'Bulacan State University',
        'Nueva Ecija University of Science and Technology', 'Tarlac State University',
        'Central Luzon State University', 'Mindanao State University',
        'West Visayas State University', 'Leyte Normal University',
    ];

    private static array $lucNames = [
        'Quezon City University', 'Pamantasan ng Lungsod ng Maynila',
        'Valenzuela City Polytechnic College', 'Pasig City College',
        'Caloocan City Polytechnic College', 'Las Piñas College',
        'Taguig City University', 'Parañaque City College',
        'Malabon City College', 'Navotas City College',
    ];

    public function definition(): array
    {
        $type = $this->faker->randomElement(['Private', 'SUC', 'LUC']);
        $namePool = match ($type) {
            'Private' => self::$privateNames,
            'SUC'     => self::$sucNames,
            'LUC'     => self::$lucNames,
        };

        $name = $this->faker->unique()->randomElement($namePool);
        $slug = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 4));

        return [
            'uii'            => $slug . $this->faker->numerify('##'),
            'name'           => $name,
            'type'           => $type,
            'code'           => strtoupper($this->faker->unique()->lexify('HEI-????')),
            'email'          => strtolower(str_replace(' ', '', $name)) . '@edu.ph',
            'phone'          => '(02) ' . $this->faker->numerify('####-####'),
            'address'        => $this->faker->streetAddress() . ', ' . $this->faker->randomElement([
                'Quezon City', 'Manila', 'Makati', 'Pasig', 'Taguig',
                'Caloocan', 'Batangas City', 'Bulacan', 'Cavite City', 'Santa Rosa, Laguna',
            ]),
            'established_at' => $this->faker->dateTimeBetween('1950-01-01', '2010-12-31')->format('Y-m-d'),
            'is_active'      => true,
        ];
    }
}
