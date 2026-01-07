from django.db import models
from django.contrib.auth.models import User

# python manage.py makemigrations
# python manage.py migrate

class LaunchVehicle(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название")
    short_description = models.TextField(blank=True, null=True, verbose_name="Краткое описание")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    gto_playload = models.IntegerField(verbose_name="Полезная нагрузка (кг)")
    imagerocket = models.ImageField(verbose_name="Изображение",blank=True, null=True,
                                upload_to="rockets/")
    is_active = models.BooleanField(verbose_name = "Активно", default=True)

    class Meta:
        verbose_name = "Ракета-носитель"
        verbose_name_plural = "Ракеты-носители"

    def __str__(self):
        return self.name
    
class PayloadCalculation(models.Model):
    class OrderStatus(models.TextChoices):
        DRAFT = "Черновик"
        DELETED = "Удален"
        FORMED = "В расчете"
        COMPLETED = "Расчет завершен"
        REJECTED = "Ошибка в расчете"

    status = models.CharField(
        max_length=25,
        choices=OrderStatus.choices,
        default=OrderStatus.DRAFT,
    )

    comment = models.TextField(blank=True, null=True, verbose_name="Комментарий")
    location = models.IntegerField(verbose_name="Широта космодрома",blank=True, null=True)
    port_name = models.CharField(max_length=100, verbose_name="Порт",blank=True, null=True)
    creation_datetime = models.DateTimeField(auto_now_add=True)
    formation_datetime = models.DateTimeField(blank=True, null=True)
    completion_datetime = models.DateTimeField(blank=True, null=True)
    client = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='created_orders')
    manager = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='managed_orders', blank=True, null=True)
    user = models.ForeignKey('AuthUser', on_delete=models.DO_NOTHING, null=True, blank=False, verbose_name="Лаборант")

    def __str__(self):
        return f"Заказ № {self.id}"
    
class CalculationRequest(models.Model):
     

    payload_calculation = models.ForeignKey(PayloadCalculation,null=True,on_delete=models.DO_NOTHING, verbose_name="Пользователь")
    rocket = models.ForeignKey(LaunchVehicle, on_delete=models.DO_NOTHING, verbose_name="Ракета")
    result = models.IntegerField(verbose_name="Результат вычислений")
    
    

    class Meta:
        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"

    def __str__(self):
        return f"{self.user} - {self.rocket} - {self.port}"

class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()
    first_name = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_user'



# models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import random
import string
from datetime import timedelta

class TwoFactorAuth(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_2fa_enabled = models.BooleanField(default=False)
    
    def __str__(self):
        return f"2FA для {self.user.username}"

class VerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Код {self.code} для {self.user.username}"
    
    def is_valid(self):
        # Код действителен 10 минут
        expiration_time = self.created_at + timedelta(minutes=10)
        return not self.is_used and timezone.now() < expiration_time
    
    @staticmethod
    def generate_code(length=6):
        return ''.join(random.choices(string.digits, k=length))
