<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\SuperAdmin\AdminManagementController;
use App\Http\Controllers\Admin\HEIManagementController;
use App\Http\Controllers\HEI\GeneralInformationController;
use App\Http\Controllers\HEI\AnnexAController;
use App\Http\Controllers\HEI\AnnexBController;
use App\Http\Controllers\HEI\AnnexCController;
use App\Http\Controllers\HEI\AnnexDController;
use App\Http\Controllers\HEI\AnnexEController;
use App\Http\Controllers\HEI\AnnexFController;
use App\Http\Controllers\HEI\AnnexGController;
use App\Http\Controllers\HEI\AnnexHController;
use App\Http\Controllers\HEI\AnnexIController;
use App\Http\Controllers\HEI\AnnexJController;
use App\Http\Controllers\HEI\AnnexKController;
use App\Http\Controllers\HEI\AnnexLController;
use App\Http\Controllers\HEI\AnnexMController;
use App\Http\Controllers\HEI\AnnexNController;
use App\Http\Controllers\HEI\AnnexOController;
use Illuminate\Support\Facades\Route;

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Common authenticated routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('/change-password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('/change-password', [PasswordController::class, 'update'])->name('password.update');

    // SuperAdmin routes
    Route::middleware('role:superadmin')->prefix('superadmin')->group(function () {
        Route::get('/dashboard', function () {
            return inertia('SuperAdmin/Dashboard');
        })->name('superadmin.dashboard');

        Route::get('/admin-management', [AdminManagementController::class, 'index'])->name('superadmin.admin-management');
        Route::post('/admins', [AdminManagementController::class, 'store'])->name('superadmin.admins.store');
        Route::put('/admins/{admin}', [AdminManagementController::class, 'update'])->name('superadmin.admins.update');
        Route::delete('/admins/{admin}', [AdminManagementController::class, 'destroy'])->name('superadmin.admins.destroy');

        Route::get('/system-audit-logs', function () {
            return inertia('SuperAdmin/SystemAuditLogs');
        })->name('superadmin.system-audit-logs');

        Route::get('/settings', [App\Http\Controllers\SuperAdmin\SettingsController::class, 'index'])->name('superadmin.settings');
        Route::post('/settings', [App\Http\Controllers\SuperAdmin\SettingsController::class, 'store'])->name('superadmin.settings.store');
    });

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', function () {
            return inertia('Admin/Dashboard');
        })->name('admin.dashboard');

        Route::get('/hei-accounts', [HEIManagementController::class, 'index'])->name('admin.hei-accounts');
        Route::post('/heis', [HEIManagementController::class, 'store'])->name('admin.heis.store');
        Route::put('/heis/{hei}', [HEIManagementController::class, 'update'])->name('admin.heis.update');
        Route::delete('/heis/{hei}', [HEIManagementController::class, 'destroy'])->name('admin.heis.destroy');

        Route::get('/submissions', [App\Http\Controllers\Admin\SubmissionController::class, 'index'])->name('admin.submissions.index');
        Route::get('/submissions/requests', [App\Http\Controllers\Admin\SubmissionController::class, 'requests'])->name('admin.submissions.requests');
        Route::get('/submissions/{id}', [App\Http\Controllers\Admin\SubmissionController::class, 'show'])->name('admin.submissions.show');
        Route::post('/submissions/{id}/approve', [App\Http\Controllers\Admin\SubmissionController::class, 'approve'])->name('admin.submissions.approve');
        Route::post('/submissions/{id}/reject', [App\Http\Controllers\Admin\SubmissionController::class, 'reject'])->name('admin.submissions.reject');

        Route::get('/audit-logs', function () {
            return inertia('Admin/AuditLogs');
        })->name('admin.audit-logs');

        Route::get('/ched-contacts', function () {
            return inertia('Admin/CHEDContacts');
        })->name('admin.ched-contacts');
    });

    // HEI routes
    Route::middleware('role:hei')->prefix('hei')->group(function () {
        Route::get('/dashboard', function () {
            return inertia('HEI/Dashboard');
        })->name('hei.dashboard');

        Route::get('/general-information/create', [GeneralInformationController::class, 'create'])->name('hei.general-information.create');
        Route::post('/general-information', [GeneralInformationController::class, 'store'])->name('hei.general-information.store');
        Route::get('/general-information/{id}/edit', [GeneralInformationController::class, 'edit'])->name('hei.general-information.edit');
        Route::put('/general-information/{id}', [GeneralInformationController::class, 'update'])->name('hei.general-information.update');
        Route::post('/general-information/{id}/cancel', [GeneralInformationController::class, 'cancel'])->name('hei.general-information.cancel');
        Route::get('/general-information/history', [GeneralInformationController::class, 'history'])->name('hei.general-information.history');

        // Annex A routes
        Route::get('/annex-a/submit', [AnnexAController::class, 'create'])->name('hei.annex-a.submit');
        Route::post('/annex-a', [AnnexAController::class, 'store'])->name('hei.annex-a.store');
        Route::get('/annex-a/history', [AnnexAController::class, 'history'])->name('hei.annex-a.history');
        Route::get('/annex-a/{batch_id}/programs', [AnnexAController::class, 'getBatchPrograms'])->name('hei.annex-a.programs');
        Route::get('/annex-a/{batch_id}/edit', [AnnexAController::class, 'edit'])->name('hei.annex-a.edit');
        Route::post('/annex-a/{batch_id}/cancel', [AnnexAController::class, 'cancel'])->name('hei.annex-a.cancel');

        // Annex B routes
        Route::get('/annex-b/submit', [AnnexBController::class, 'create'])->name('hei.annex-b.submit');
        Route::post('/annex-b', [AnnexBController::class, 'store'])->name('hei.annex-b.store');
        Route::get('/annex-b/history', [AnnexBController::class, 'history'])->name('hei.annex-b.history');
        Route::get('/annex-b/{batch_id}/programs', [AnnexBController::class, 'getBatchPrograms'])->name('hei.annex-b.programs');
        Route::get('/annex-b/{batch_id}/edit', [AnnexBController::class, 'edit'])->name('hei.annex-b.edit');
        Route::post('/annex-b/{batch_id}/cancel', [AnnexBController::class, 'cancel'])->name('hei.annex-b.cancel');

        // Annex C routes
        Route::get('/annex-c/submit', [AnnexCController::class, 'create'])->name('hei.annex-c.submit');
        Route::post('/annex-c', [AnnexCController::class, 'store'])->name('hei.annex-c.store');
        Route::get('/annex-c/history', [AnnexCController::class, 'history'])->name('hei.annex-c.history');
        Route::get('/annex-c/{batch_id}/programs', [AnnexCController::class, 'getBatchPrograms'])->name('hei.annex-c.programs');
        Route::get('/annex-c/{batch_id}/edit', [AnnexCController::class, 'edit'])->name('hei.annex-c.edit');
        Route::post('/annex-c/{batch_id}/cancel', [AnnexCController::class, 'cancel'])->name('hei.annex-c.cancel');

        // Annex D routes
        Route::get('/annex-d/submit', [AnnexDController::class, 'create'])->name('hei.annex-d.submit');
        Route::post('/annex-d', [AnnexDController::class, 'store'])->name('hei.annex-d.store');
        Route::get('/annex-d/history', [AnnexDController::class, 'history'])->name('hei.annex-d.history');
        Route::get('/annex-d/{submission_id}/edit', [AnnexDController::class, 'edit'])->name('hei.annex-d.edit');
        Route::post('/annex-d/{submission_id}/cancel', [AnnexDController::class, 'cancel'])->name('hei.annex-d.cancel');

        // Annex E routes
        Route::get('/annex-e/submit', [AnnexEController::class, 'create'])->name('hei.annex-e.submit');
        Route::post('/annex-e', [AnnexEController::class, 'store'])->name('hei.annex-e.store');
        Route::get('/annex-e/history', [AnnexEController::class, 'history'])->name('hei.annex-e.history');
        Route::get('/annex-e/{batch_id}/organizations', [AnnexEController::class, 'getBatchOrganizations'])->name('hei.annex-e.organizations');
        Route::get('/annex-e/{batch_id}/edit', [AnnexEController::class, 'edit'])->name('hei.annex-e.edit');
        Route::post('/annex-e/{batch_id}/cancel', [AnnexEController::class, 'cancel'])->name('hei.annex-e.cancel');

        // Annex F routes
        Route::get('/annex-f/submit', [AnnexFController::class, 'create'])->name('hei.annex-f.submit');
        Route::post('/annex-f', [AnnexFController::class, 'store'])->name('hei.annex-f.store');
        Route::get('/annex-f/history', [AnnexFController::class, 'history'])->name('hei.annex-f.history');
        Route::get('/annex-f/{batch_id}/activities', [AnnexFController::class, 'getBatchActivities'])->name('hei.annex-f.activities');
        Route::get('/annex-f/{batch_id}/edit', [AnnexFController::class, 'edit'])->name('hei.annex-f.edit');
        Route::post('/annex-f/{batch_id}/cancel', [AnnexFController::class, 'cancel'])->name('hei.annex-f.cancel');

        // Annex G routes
        Route::get('/annex-g/submit', [AnnexGController::class, 'create'])->name('hei.annex-g.submit');
        Route::post('/annex-g', [AnnexGController::class, 'store'])->name('hei.annex-g.store');
        Route::get('/annex-g/history', [AnnexGController::class, 'history'])->name('hei.annex-g.history');
        Route::get('/annex-g/{submission_id}/data', [AnnexGController::class, 'getSubmissionData'])->name('hei.annex-g.data');
        Route::get('/annex-g/{submission_id}/edit', [AnnexGController::class, 'edit'])->name('hei.annex-g.edit');
        Route::post('/annex-g/{submission_id}/cancel', [AnnexGController::class, 'cancel'])->name('hei.annex-g.cancel');

        // Annex H routes
        Route::get('/annex-h/submit', [AnnexHController::class, 'create'])->name('hei.annex-h.submit');
        Route::post('/annex-h', [AnnexHController::class, 'store'])->name('hei.annex-h.store');
        Route::get('/annex-h/history', [AnnexHController::class, 'history'])->name('hei.annex-h.history');
        Route::get('/annex-h/{batch_id}/data', [AnnexHController::class, 'getBatchData'])->name('hei.annex-h.data');
        Route::get('/annex-h/{batch_id}/edit', [AnnexHController::class, 'edit'])->name('hei.annex-h.edit');
        Route::post('/annex-h/{batch_id}/cancel', [AnnexHController::class, 'cancel'])->name('hei.annex-h.cancel');

        // Annex I routes
        Route::get('/annex-i/submit', [AnnexIController::class, 'create'])->name('hei.annex-i.submit');
        Route::post('/annex-i', [AnnexIController::class, 'store'])->name('hei.annex-i.store');
        Route::get('/annex-i/history', [AnnexIController::class, 'history'])->name('hei.annex-i.history');
        Route::get('/annex-i/{batch_id}/scholarships', [AnnexIController::class, 'getBatchScholarships'])->name('hei.annex-i.scholarships');
        Route::get('/annex-i/{batch_id}/edit', [AnnexIController::class, 'edit'])->name('hei.annex-i.edit');
        Route::post('/annex-i/{batch_id}/cancel', [AnnexIController::class, 'cancel'])->name('hei.annex-i.cancel');

        // Annex J routes
        Route::get('/annex-j/submit', [AnnexJController::class, 'create'])->name('hei.annex-j.submit');
        Route::post('/annex-j', [AnnexJController::class, 'store'])->name('hei.annex-j.store');
        Route::get('/annex-j/history', [AnnexJController::class, 'history'])->name('hei.annex-j.history');
        Route::get('/annex-j/{batch_id}/programs', [AnnexJController::class, 'getBatchPrograms'])->name('hei.annex-j.programs');
        Route::get('/annex-j/{batch_id}/edit', [AnnexJController::class, 'edit'])->name('hei.annex-j.edit');
        Route::post('/annex-j/{batch_id}/cancel', [AnnexJController::class, 'cancel'])->name('hei.annex-j.cancel');

        // Annex K routes
        Route::get('/annex-k/submit', [AnnexKController::class, 'create'])->name('hei.annex-k.submit');
        Route::post('/annex-k', [AnnexKController::class, 'store'])->name('hei.annex-k.store');
        Route::get('/annex-k/history', [AnnexKController::class, 'history'])->name('hei.annex-k.history');
        Route::get('/annex-k/{batch_id}/committees', [AnnexKController::class, 'getBatchCommittees'])->name('hei.annex-k.committees');
        Route::get('/annex-k/{batch_id}/edit', [AnnexKController::class, 'edit'])->name('hei.annex-k.edit');
        Route::post('/annex-k/{batch_id}/cancel', [AnnexKController::class, 'cancel'])->name('hei.annex-k.cancel');

        // Annex L routes
        Route::get('/annex-l/submit', [AnnexLController::class, 'create'])->name('hei.annex-l.submit');
        Route::post('/annex-l', [AnnexLController::class, 'store'])->name('hei.annex-l.store');
        Route::get('/annex-l/history', [AnnexLController::class, 'history'])->name('hei.annex-l.history');
        Route::get('/annex-l/{batch_id}/housing', [AnnexLController::class, 'getBatchHousing'])->name('hei.annex-l.housing');
        Route::get('/annex-l/{batch_id}/edit', [AnnexLController::class, 'edit'])->name('hei.annex-l.edit');
        Route::post('/annex-l/{batch_id}/cancel', [AnnexLController::class, 'cancel'])->name('hei.annex-l.cancel');

        // Annex M routes
        Route::get('/annex-m/submit', [AnnexMController::class, 'create'])->name('hei.annex-m.submit');
        Route::post('/annex-m', [AnnexMController::class, 'store'])->name('hei.annex-m.store');
        Route::get('/annex-m/history', [AnnexMController::class, 'history'])->name('hei.annex-m.history');
        Route::get('/annex-m/{batch_id}/data', [AnnexMController::class, 'getBatchData'])->name('hei.annex-m.data');
        Route::get('/annex-m/{batch_id}/edit', [AnnexMController::class, 'edit'])->name('hei.annex-m.edit');
        Route::post('/annex-m/{batch_id}/cancel', [AnnexMController::class, 'cancel'])->name('hei.annex-m.cancel');

        // Annex N routes
        Route::get('/annex-n/submit', [AnnexNController::class, 'create'])->name('hei.annex-n.submit');
        Route::post('/annex-n', [AnnexNController::class, 'store'])->name('hei.annex-n.store');
        Route::get('/annex-n/history', [AnnexNController::class, 'history'])->name('hei.annex-n.history');
        Route::get('/annex-n/{batch_id}/activities', [AnnexNController::class, 'getBatchActivities'])->name('hei.annex-n.activities');
        Route::get('/annex-n/{batch_id}/edit', [AnnexNController::class, 'edit'])->name('hei.annex-n.edit');
        Route::post('/annex-n/{batch_id}/cancel', [AnnexNController::class, 'cancel'])->name('hei.annex-n.cancel');

        // Annex O routes
        Route::get('/annex-o/submit', [AnnexOController::class, 'create'])->name('hei.annex-o.submit');
        Route::post('/annex-o', [AnnexOController::class, 'store'])->name('hei.annex-o.store');
        Route::get('/annex-o/history', [AnnexOController::class, 'history'])->name('hei.annex-o.history');
        Route::get('/annex-o/{batch_id}/programs', [AnnexOController::class, 'getBatchPrograms'])->name('hei.annex-o.programs');
        Route::get('/annex-o/{batch_id}/edit', [AnnexOController::class, 'edit'])->name('hei.annex-o.edit');
        Route::post('/annex-o/{batch_id}/cancel', [AnnexOController::class, 'cancel'])->name('hei.annex-o.cancel');

        Route::get('/notifications', function () {
            return inertia('HEI/Notifications');
        })->name('hei.notifications');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('hei.profile');
        Route::put('/profile', [ProfileController::class, 'update'])->name('hei.profile.update');
    });
});

// Redirect root to login
Route::get('/', function () {
    return redirect('/login');
});
