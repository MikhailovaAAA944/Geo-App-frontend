import random
from django.shortcuts import render
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from launchvehicle.minio import add_pic
from launchvehicle.serializers import LaunchVehicleSerializer
from launchvehicle.models import LaunchVehicle
from launchvehicle.models import AuthUser
from launchvehicle.serializers import UserSerializer
from launchvehicle.models import PayloadCalculation
from launchvehicle.serializers import PayloadCalculationSerializer
from launchvehicle.models import CalculationRequest
from launchvehicle.serializers import CalculationRequestSerializer
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.db.models import Q
from django.contrib.auth import authenticate




def get_draft_calculation():
    return PayloadCalculation.objects.filter(status="Черновик").first()


def get_user():
    return User.objects.filter(is_superuser=False).first()


def get_moderator():
    return User.objects.filter(is_superuser=True).first()

#Методы для услуг

class LaunchVehicleList(APIView):
    model_class = LaunchVehicle
    serializer_class = LaunchVehicleSerializer

    # Возвращает список 
    def get(self, request, format=None):
        queryset = self.model_class.objects.all()
        
        # Получаем параметр name для поиска
        name = request.query_params.get('name')
        print 
        # Применяем фильтрацию только по полю name
        if name:
            # Поиск по вхождению подстроки (без учета регистра)
            queryset = queryset.filter(Q(name__icontains=name)|Q(name__istartswith=name))
        
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    

    # Добавляет новую *с изображением
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            rocket = serializer.save()
            pic = request.FILES.get("imagerocket")
            pic_result = add_pic(rocket, pic)
            # Если в результате вызова add_pic результат - ошибка, возвращаем его.
            if 'error' in pic_result.data:    
                return pic_result
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LaunchVehicleDetail(APIView):
    model_class = LaunchVehicle
    serializer_class = LaunchVehicleSerializer

    # Возвращает информацию об ракете
    def get(self, request, pk, format=None):
        rocket = get_object_or_404(self.model_class, pk=pk)
        serializer = self.serializer_class(rocket)
        return Response(serializer.data)

    
        
    # Обновляет информацию об ракете (для модератора)
    def put(self, request, pk, format=None):
        launchvehicle = get_object_or_404(self.model_class, pk=pk)
        serializer = self.serializer_class(launchvehicle, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Удаляет информацию об ракете
    def delete(self, request, pk, format=None):
        launchvehicle = get_object_or_404(self.model_class, pk=pk)
        launchvehicle.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def create_rocket(request):
    # Используем данные из запроса для создания ракеты
    serializer = LaunchVehicleSerializer(data=request.data)
    
    if serializer.is_valid():
        # Сохраняем объект в базу данных
        rocket = serializer.save()
        
        # Возвращаем данные созданной ракеты  
        return Response(LaunchVehicleSerializer(rocket).data, status=status.HTTP_201_CREATED)
    
    # Если данные невалидны, возвращаем ошибки
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Обновляет информацию об ракете (для пользователя)    
@api_view(['Put'])
def put(self, request, pk, format=None):
    LaunchVehicle = get_object_or_404(self.model_class, pk=pk)
    serializer = self.serializer_class(LaunchVehicle, data=request.data, partial=True)
    # Изменение фото логотипа
    if 'pic' in serializer.initial_data:
        pic_result = add_pic(LaunchVehicle, serializer.initial_data['pic'])
        if 'error' in pic_result.data:
            return pic_result
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from django.utils import timezone
@api_view(["POST"])
def add_rocket_to_calculation(request, rocket_id):
    if not LaunchVehicle.objects.filter(pk=rocket_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    rocket = LaunchVehicle.objects.get(pk=rocket_id)

    draft_playload = PayloadCalculation.objects.filter(status = "Черновик").first()

    if draft_playload is None:
        draft_playload = PayloadCalculation()
        draft_playload.client = get_user()
        draft_playload.formation_datetime = timezone.now()
        draft_playload.save()

    if CalculationRequest.objects.filter(payload_calculation=draft_playload, rocket=rocket).exists():
        return Response(data={'text':'Ракета добавлена'},status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
    item = CalculationRequest()
    item.payload_calculation = draft_playload
    item.rocket = rocket
    item.result = 1
    item.save()

    serializer = CalculationRequestSerializer(item)
    return Response(serializer.data)



# Методы для заявок

#Вывод иконки корзины
@api_view(["GET"])
def basket_cnt_calk(request):

    total_count = CalculationRequest.objects.count()


    return Response(data={'img':'django_media/logo.png', 'total_count':int(total_count)})


#Вывод списка заявок с сортировкой
@api_view(["GET"])
def search_payload(request):
    status = request.GET.get("status", "Черновик")
    

    calculations = PayloadCalculation.objects.all()

    if status:
        calculations = calculations.filter(status=status)
 

    serializer = PayloadCalculationSerializer(calculations, many=True)

    return Response(serializer.data)

#Вывод 1 заявки
@api_view(["GET"])
def get_calculation_by_id(request, calculation_id):
    if not PayloadCalculation.objects.filter(pk=calculation_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    calculation = PayloadCalculation.objects.get(pk=calculation_id)
    serializer = PayloadCalculationSerializer(calculation, many=False)

    return Response(serializer.data)

#Изменение полей заявки
@api_view(["PUT"])
def update_calculation(request, calculation_id):
    if not PayloadCalculation.objects.filter(pk=calculation_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    calculation = PayloadCalculation.objects.get(pk=calculation_id)
    serializer = PayloadCalculationSerializer(calculation, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

#сформировать создателем (дата формирования)
@api_view(["PUT"])
def update_status_user(request, calculation_id):
    if not PayloadCalculation.objects.filter(pk=calculation_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    calculation = PayloadCalculation.objects.get(pk=calculation_id)

    if calculation.status != "Черновик":
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    calculation.status = "В расчете"
    calculation.formation_datetime = timezone.now()
    calculation.save()

    serializer = PayloadCalculationSerializer(calculation, many=False)

    return Response(serializer.data)

#завершить/отклонить модератором
@api_view(["PUT"])
def update_status_admin(request, calculation_id):
    if not PayloadCalculation.objects.filter(pk=calculation_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    request_status = str(request.data["status"])

    if request_status not in ["Расчет завершен", "Ошибка в расчете"]:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    calculation = PayloadCalculation.objects.get(pk=calculation_id)
 

    calculation.completion_datetime = timezone.now()
    calculation.status = request_status
    calculation.manager = get_moderator()
    calculation.save()

    return Response(data={"text":"Статус обновален"},status=status.HTTP_200_OK)

#Удаление заявки
@api_view(["DELETE"])
def delete_calculation(request, calculation_id):
    if not PayloadCalculation.objects.filter(pk=calculation_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    calculation = PayloadCalculation.objects.get(pk=calculation_id)

    if calculation.status != "Черновик":
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    calculation.status = "Удален"
    calculation.save()

    serializer = PayloadCalculationSerializer(calculation, many=False)

    return Response(serializer.data)
    


class PayloadCalculationView(APIView):
    model_class = PayloadCalculation
    serializer_class = PayloadCalculationSerializer

    def get(self,request, format=None):
        pass


#Методы для м-м

#удаление из заявки (без PK м-м)

@api_view(["DELETE"])
def delete_rocket_from_calculation(request, payload_calculation_id, rocket_id):
    if not CalculationRequest.objects.filter(payload_calculation_id=payload_calculation_id, rocket_id=rocket_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    item = CalculationRequest.objects.get(payload_calculation_id=payload_calculation_id, rocket_id=rocket_id)
    item.delete()

    calculation = PayloadCalculation.objects.get(pk=payload_calculation_id)

    serializer = PayloadCalculationSerializer(calculation, many=False)
    data = serializer.data
 
    return Response(data)

#изменение количества/порядка/значения в м-м (без PK м-м)

@api_view(["PUT"])
def update_rocket_in_calculation(request, calculation_id, rocket_id):
    if not CalculationRequest.objects.filter(rocket_id=rocket_id, payload_calculation_id=calculation_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    item = CalculationRequest.objects.get(rocket_id=rocket_id, payload_calculation_id=calculation_id)

    serializer = CalculationRequestSerializer(item, data=request.data,  partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

class CalculationRequestView(APIView):
    model_class = CalculationRequest
    serializer_class = CalculationRequestSerializer

    def delete(self, request, pk, format=None):
        CalculationRequest = get_object_or_404(self.model_class, pk=pk)
        CalculationRequest.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)




from django.contrib.auth.models import User
from launchvehicle.serializers import UserRegisterSerializer, UserLoginSerializer 


#Методы для пользователей

class UsersList(APIView):
    model_class = AuthUser
    serializer_class = UserSerializer

    def get(self, request, format=None):
        user = self.model_class.objects.all()
        serializer = self.serializer_class(user, many=True)
        return Response(serializer.data)
    


@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    user = serializer.save()

    serializer = UserSerializer(user)

    return Response(serializer.data, status=status.HTTP_201_CREATED)

# from rest_framework import status, generics, permissions
# from rest_framework.response import Response
# from django.http import HttpRequest
# class UserRegistrationView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserRegisterSerializer
#     permission_classes = [permissions.AllowAny]

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.save()
        
#         # Создаем Django HttpRequest для функции login
#         django_request = HttpRequest()
#         django_request.session = request.session
#         login(django_request, user)
        
#         return Response({
#             'user': UserSerializer(user).data,
#             'message': 'Пользователь успешно зарегистрирован'
#         }, status=status.HTTP_201_CREATED)

@api_view(["POST"])
def login(request):
    serializer = UserLoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(**serializer.data)
    if user is None:
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    serializer = UserSerializer(user)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def logout(request):
    return Response(status=status.HTTP_200_OK)


@api_view(["PUT"])
def update_user(request, user_id):
    if not User.objects.filter(pk=user_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = User.objects.get(pk=user_id)
    serializer = UserSerializer(user, data=request.data, partial=True)

    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    serializer.save()

    return Response(serializer.data)