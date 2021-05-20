<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Blade;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register() {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot() {
        Blade::withoutDoubleEncoding();
        
        $viewer = view()->composer('*', function($view){
            $view_name = str_replace('.', '-', $view->getName());
            view()->share('view_name', $view_name);
        });
        
        \Debugbar::enable();
        \Debugbar::error('Error!');
        \Debugbar::warning('Watch out…');
        \Debugbar::addMessage('You\'re currently on the XYZ page', 'current');
        // \Debugbar::addMessage(json_encode($viewer), 'current'); array to string conversion
        \Debugbar::addMessage($viewer[0], 'current');
        Paginator::useBootstrap();
    }
}
