from launchvehicle.models import LaunchVehicle
from launchvehicle.models import AuthUser
from launchvehicle.models import PayloadCalculation
from launchvehicle.models import CalculationRequest
from rest_framework import serializers
from django.contrib.auth.models import User

class LaunchVehicleSerializer(serializers.ModelSerializer):
    # StringRelatedField вернет строковое представление объекта, то есть его имя
    # user = serializers.StringRelatedField(read_only=True) 

    class Meta:
        # Модель, которую мы сериализуем
        model = LaunchVehicle
        # Поля, которые мы сериализуем
        fields = ["pk","name", "short_description", "description", "gto_playload", "imagerocket", "is_active"]


class CalculationRequestSerializer(serializers.ModelSerializer):
    rocket = LaunchVehicleSerializer()  # или RocketSerializer если есть
    
    class Meta:
        model = CalculationRequest
        fields = ['id', 'rocket', 'result']


class PayloadCalculationSerializer(serializers.ModelSerializer):
    # StringRelatedField вернет строковое представление объекта, то есть его имя
    user = serializers.StringRelatedField(read_only=True)
    rockets = CalculationRequestSerializer(
        source='calculationrequest_set', 
        many=True, 
        read_only=True
    )

    class Meta:
        model = PayloadCalculation
        fields =["pk","status","comment","location","port_name","creation_datetime",
                 "formation_datetime","completion_datetime","client","manager","user", "rockets"]



class UserSerializer(serializers.ModelSerializer):
    payloadcalculation_set = PayloadCalculationSerializer(many=True, read_only=True)

    class Meta:
        model = AuthUser
        fields = ["id", "first_name", "last_name", "payloadcalculation_set"]


class CalculationRequestSerializer(serializers.ModelSerializer):


     class Meta:
        model = CalculationRequest
        fields =["pk","payload_calculation","rocket","result"]



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username')


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'username')
        write_only_fields = ('password',)
        read_only_fields = ('id',)

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            username=validated_data['username']
        )

        user.set_password(validated_data['password'])
        user.save()

        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)


# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import VerificationCode, TwoFactorAuth
import logging

logger = logging.getLogger(__name__)

class User2ASerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class Login2ASerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return {'user': user}
        raise serializers.ValidationError("Неверные учетные данные")

class Verify2ACodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, min_length=6)
    
    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Код должен содержать только цифры")
        return value

class Enable2FASerializer(serializers.Serializer):
    enable = serializers.BooleanField()
