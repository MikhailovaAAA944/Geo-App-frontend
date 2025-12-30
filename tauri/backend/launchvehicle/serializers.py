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



class PayloadCalculationSerializer(serializers.ModelSerializer):
    # StringRelatedField вернет строковое представление объекта, то есть его имя
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = PayloadCalculation
        fields =["pk","status","comment","location","port_name","creation_datetime","formation_datetime","completion_datetime","client","manager","user"]



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
