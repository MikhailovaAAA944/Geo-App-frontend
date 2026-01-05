"""
URL configuration for geo_app_lab3 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from launchvehicle import views
from django.urls import include, path
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
    # Набор методов для услуг:
    path('api/rockets/', views.LaunchVehicleList.as_view(), name='launchvehicle-list'),
    path('api/launchvehicle/', views.LaunchVehicleList.as_view(), name='launchvehicle-list'),
    path('api/rockets/<int:pk>/', views.LaunchVehicleDetail.as_view(), name='launchvehicle-detail'),
    path('api/rocket/<int:pk>/', views.LaunchVehicleDetail.as_view(), name='launchvehicle-detail'),
    path('api/launchvehicle/<int:pk>/', views.LaunchVehicleDetail.as_view(), name='launchvehicle-detail'),
    path('api/launchvehicle/create/', views.create_rocket, name='create_rocket'),
    path('api/launchvehicle/<int:pk>/put/', views.put, name='launchvehicle-put'),
    path('api/launchvehicle/<int:rocket_id>/add_to_calculation/', views.add_rocket_to_calculation),  # POST
    path('api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),


    # Набор методов для заявок
    path('api/payloadcalculation/basket_cnt_calk/', views.basket_cnt_calk),  # GET
    path('api/payloadcalculation/', views.search_payload),  # GET
    path('api/payloadcalculation/<int:calculation_id>/', views.get_calculation_by_id),  # GET
    path('api/payloadcalculation/<int:calculation_id>/update/', views.update_calculation),  # PUT
    path('api/payloadcalculation/<int:calculation_id>/update_status_user/', views.update_status_user),  # PUT
    path('api/payloadcalculation/<int:calculation_id>/update_status_admin/', views.update_status_admin),  # PUT
    path('api/payloadcalculation/<int:calculation_id>/delete/', views.delete_calculation),  # DELETE

    # Набор методов для м-м
    path('api/payloadcalculation/<int:calculation_id>/update_rocket/<int:rocket_id>/', views.update_rocket_in_calculation),  # PUT
    path('api/payloadcalculation/<int:payload_calculation_id>/delete_rocket/<int:rocket_id>/', views.delete_rocket_from_calculation),  # DELETE

    # Набор методов для пользователей
    path('api/users/register/', views.register), # POST
    path('api/users/login/', views.login), # POST
    path('api/users/logout/', views.logout), # POST
    path('api/users/<int:user_id>/update/', views.update_user), # PUT
    path('api/users/', views.UsersList.as_view(), name='users-list') #GET
]
