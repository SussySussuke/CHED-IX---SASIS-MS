<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Prevent the browser from serving stale pages from its own cache.
     * This is especially important for admin/HEI dashboards where data
     * changes frequently and back-button navigation must show fresh data.
     */
    public function handle(Request $request, \Closure $next): Response
    {
        $response = parent::handle($request, $next);

        if ($request->user()) {
            $response->headers->set('Cache-Control', 'no-store, private');
            $response->headers->set('Pragma', 'no-cache');
        }

        return $response;
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                    'role' => $user->account_type,
                    'is_active' => $user->is_active,
                    'hei' => $user->hei ? [
                        'id' => $user->hei->id,
                        'name' => $user->hei->name,
                        'type' => $user->hei->type,
                        'code' => $user->hei->code,
                        'email' => $user->hei->email,
                        'address' => $user->hei->address,
                    ] : null,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
        ]);
    }
}
