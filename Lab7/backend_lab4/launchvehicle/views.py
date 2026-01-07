import random
from django.shortcuts import render
from django.conf import settings
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.core.cache import cache
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
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from django.contrib.auth import authenticate

from .jwt_helper import *
from .jwt_helper import create_session
from .permissions import *
from .serializers import *
from .utils import identity_user




def get_draft_calculation(request):
    
    user = identity_user(request)

    if user is None:
        return None
    
    return PayloadCalculation.objects.filter(status="DRAFT", client=user).first()
 

 

#Методы для услуг

class LaunchVehicleList(APIView):
    model_class = LaunchVehicle
    serializer_class = LaunchVehicleSerializer

    # Возвращает список 
    def get(self, request, format=None):
        launch_vehicle = self.model_class.objects.all()

        # Получаем параметры запроса для фильтрации
        query_params = request.query_params

        # Применяем фильтрацию по параметрам
        launch_vehicle = self.apply_filters(launch_vehicle, query_params)
    
        serializer = self.serializer_class(launch_vehicle, many=True)
        return Response(serializer.data)
    
    def apply_filters(self, queryset, query_params):
        """
        Применяет фильтрацию к queryset на основе параметров запроса
        """
        # Примеры фильтрации по различным полям
        filters = Q()
        
        # Фильтрация по строковым полям (точное совпадение)
        if 'name' in query_params:
            filters &= Q(name__icontains=query_params['name'])
        
        return queryset.filter(filters)

    # Добавляет новую *с изображением
    @permission_classes([IsModerator])
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
    @permission_classes([IsModerator])
    def put(self, request, pk, format=None):
        launchvehicle = get_object_or_404(self.model_class, pk=pk)
        serializer = self.serializer_class(launchvehicle, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Удаляет информацию об ракете
    @permission_classes([IsModerator])
    def delete(self, request, pk, format=None):
        launchvehicle = get_object_or_404(self.model_class, pk=pk)
        launchvehicle.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



@api_view(["POST"])
@permission_classes([IsModerator])
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
@permission_classes([IsModerator])
def update_launchvehicle(self, request, pk, format=None):
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
@permission_classes([IsAuthenticated])
def add_rocket_to_calculation(request, rocket_id):
    if not LaunchVehicle.objects.filter(pk=rocket_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    rocket = LaunchVehicle.objects.get(pk=rocket_id)

    draft_playload = PayloadCalculation.objects.filter(status = "Черновик").first()

    if draft_playload is None:
        draft_playload = PayloadCalculation()
        draft_playload.client = identity_user(request)
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
@permission_classes([IsAuthenticated])
def basket_cnt_calk(request):
    user = identity_user(request)
    total_count = CalculationRequest.objects.filter(client=user).count()


    return Response(data={'img':'django_media/logo.png', 'total_count':int(total_count)})


#Вывод списка заявок с сортировкой
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_payload(request):
    status = request.GET.get("status", "Черновик")
    
    user = identity_user(request)

    calculations = PayloadCalculation.objects.all()

    if not user.is_staff:
        calculations = calculations.filter(client=user)


    if status:
        calculations = calculations.filter(status=status)
 

    serializer = PayloadCalculationSerializer(calculations, many=True)

    return Response(serializer.data)

#Вывод 1 заявки
@api_view(["GET"])
def get_calculation_by_id(request, calculation_id):

    user = identity_user(request)
    if not PayloadCalculation.objects.filter(pk=calculation_id, client=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    calculation = PayloadCalculation.objects.get(pk=calculation_id, client=user)
    serializer = PayloadCalculationSerializer(calculation, many=False)

    return Response(serializer.data)

#Изменение полей заявки
@swagger_auto_schema(method='put', request_body=PayloadCalculationSerializer)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_calculation(request, calculation_id):

    user = identity_user(request)

    if not PayloadCalculation.objects.filter(pk=calculation_id, client=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    calculation = PayloadCalculation.objects.get(pk=calculation_id, client=user)
    serializer = PayloadCalculationSerializer(calculation, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)

#сформировать создателем (дата формирования)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_status_user(request, calculation_id):

    user = identity_user(request)
    
    if not PayloadCalculation.objects.filter(pk=calculation_id,client=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    calculation = PayloadCalculation.objects.get(pk=calculation_id,client=user)

    if calculation.status != "Черновик":
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    calculation.status = "В расчете"
    calculation.formation_datetime = timezone.now()
    calculation.save()

    serializer = PayloadCalculationSerializer(calculation, many=False)

    return Response(serializer.data)

#завершить/отклонить модератором
@api_view(["PUT"])
@permission_classes([IsModerator])
def update_status_admin(request, calculation_id):
    if not PayloadCalculation.objects.filter(pk=calculation_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    request_status = str(request.data["status"])

    if request_status not in ["Расчет завершен", "Ошибка в расчете"]:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    calculation = PayloadCalculation.objects.get(pk=calculation_id)
 

    calculation.completion_datetime = timezone.now()
    calculation.status = request_status
    calculation.manager = identity_user(request)
    calculation.save()

    return Response(data={"text":"Статус обновален"},status=status.HTTP_200_OK)

#Удаление заявки
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_calculation(request, calculation_id):
    user = identity_user(request)
    if not PayloadCalculation.objects.filter(pk=calculation_id,client=user).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    calculation = PayloadCalculation.objects.get(pk=calculation_id,client=user)

    if calculation.status != "Черновик":
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    calculation.status = "Удален"
    calculation.save()

    serializer = PayloadCalculationSerializer(calculation, many=False)

    return Response(serializer.data)
    

 


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

    @permission_classes([IsAuthenticated])
    def get(self, request, format=None):
        user = self.model_class.objects.all()
        serializer = self.serializer_class(user, many=True)
        return Response(serializer.data)
    

@swagger_auto_schema(method='post', request_body=UserRegisterSerializer)
@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    user = serializer.save()
    
    session = create_session(user.id)
    cache.set(session, settings.SESSION_LIFETIME)

    serializer = UserSerializer(user)

    response = Response(serializer.data, status=status.HTTP_201_CREATED)
    response.set_cookie('session', session, httponly=True)

    return response

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

@swagger_auto_schema(method='post', request_body=UserLoginSerializer)
@api_view(["POST"])
def login(request):
    serializer = UserLoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(**serializer.data)
    if user is None:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    

    # Создаем JWT сессию
    session_token = create_session(user.id)

    # Сохраняем в кэш с правильными аргументами
    # session_token как ключ, user.id как значение, timeout в секундах
    cache.set(
        session_token, 
        user.id, 
        timeout=int(settings.SESSION_LIFETIME.total_seconds())
    )

    serializer = UserSerializer(user)

    response = Response(serializer.data, status=status.HTTP_200_OK)
    response.set_cookie(
        'session', 
        session_token, 
        max_age=int(settings.SESSION_LIFETIME.total_seconds()),
        httponly=True,
        samesite='Lax'
    )

    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    return Response(status=status.HTTP_200_OK)


@swagger_auto_schema(method='PUT', request_body=UserSerializer)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    if not User.objects.filter(pk=user_id).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = identity_user(request)

    if user.pk != user_id:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = UserSerializer(user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(status=status.HTTP_409_CONFLICT)

    serializer.save()

    return Response(serializer.data, status=status.HTTP_200_OK)

 

# views.py
from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import logging

from .models import TwoFactorAuth, VerificationCode
from .serializers import (
    Login2ASerializer, 
    Verify2ACodeSerializer, 
    User2ASerializer,
)

logger = logging.getLogger(__name__)

from rest_framework import views, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.contrib.auth import authenticate

import logging

from .serializers import (
    Login2ASerializer, 
    User2ASerializer, 
    Verify2ACodeSerializer, 
    Enable2FASerializer
)
from .models import TwoFactorAuth, VerificationCode

logger = logging.getLogger(__name__)

class Login2AView(views.APIView):
    """
    Вход с поддержкой двухфакторной аутентификации
    """
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_description="Вход в систему с поддержкой 2FA",
        request_body=Login2ASerializer,
        responses={
            200: openapi.Response(
                description="Успешный вход или требование 2FA",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'token': openapi.Schema(type=openapi.TYPE_STRING),
                        'user': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'username': openapi.Schema(type=openapi.TYPE_STRING),
                                'email': openapi.Schema(type=openapi.TYPE_STRING),
                            }
                        ),
                        'requires_2fa': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'email': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            400: "Неверные учетные данные",
            500: "Ошибка сервера"
        }
    )
    def post(self, request):
        """
        Обработка POST запроса для входа
        """
        serializer = Login2ASerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data['user']
        
        # Проверяем, включена ли 2FA для пользователя
        two_factor_auth, created = TwoFactorAuth.objects.get_or_create(user=user)
        
        if not two_factor_auth.is_2fa_enabled:
            # Если 2FA отключена, сразу возвращаем токен
            session_token = create_session(user.id)

            return Response({
                'token': session_token,
                'user': User2ASerializer(user).data,
                'requires_2fa': False
            }, status=status.HTTP_200_OK)
        
        # Если 2FA включена, генерируем и отправляем код
        code = VerificationCode.generate_code()
        print(f"Сгенерированный код: {code}")
        
        # Помечаем старые коды как использованные
        VerificationCode.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Создаем новый код верификации
        verification_code = VerificationCode.objects.create(
            user=user,
            code=code
        )
        print(verification_code)
        
        # Отправка кода на email
        try:
            send_mail(
                subject='Ваш код двухфакторной аутентификации',
                message=f'Ваш код для входа: {code}\nКод действителен 10 минут.',
                from_email=None,  # используется DEFAULT_FROM_EMAIL
                recipient_list=[user.email],
                fail_silently=False,
            )
            logger.info(f"Код отправлен на {user.email}")
        except Exception as e:
            logger.error(f"Ошибка отправки email: {e}")
            return Response(
                {'error': 'Не удалось отправить код подтверждения'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Сохраняем user_id в сессии для верификации
        request.session['2fa_user_id'] = user.id
        request.session.save()
        
        return Response({
            'message': 'Код отправлен на email',
            'requires_2fa': True,
            'email': user.email  # Можно показывать маскированный email
        }, status=status.HTTP_200_OK)



from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import Verify2ACodeSerializer, UserSerializer
from .models import VerificationCode

class Verify2ACodeView(views.APIView):
    """
    Верификация кода двухфакторной аутентификации.
    
    После успешного входа с включенной 2FA, пользователь получает код на email.
    Этот эндпоинт проверяет введенный код и завершает аутентификацию.
    """
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Подтверждение кода 2FA",
        operation_description="""
        Проверяет код двухфакторной аутентификации, отправленный на email пользователя.
        
        **Требования:**
        - Пользователь должен предварительно пройти первый этап аутентификации через /api/login2a/
        - Код должен быть получен на email пользователя
        - Код действителен в течение 10 минут
        
        **Процесс работы:**
        1. Пользователь вводит код из email
        2. Система проверяет код на валидность
        3. При успешной проверке создается сессия
        4. Возвращается токен сессии для последующих запросов
        """,
        request_body=Verify2ACodeSerializer,
        responses={
            200: openapi.Response(
                description="Код подтвержден успешно",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'session_token': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Токен сессии для аутентификации"
                        ),
                        'user': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            description="Информация о пользователе",
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'username': openapi.Schema(type=openapi.TYPE_STRING),
                                'email': openapi.Schema(type=openapi.TYPE_STRING),
                                'first_name': openapi.Schema(type=openapi.TYPE_STRING),
                                'last_name': openapi.Schema(type=openapi.TYPE_STRING),
                            }
                        ),
                        'message': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description="Сообщение об успешной аутентификации"
                        )
                    }
                ),
                examples={
                    'application/json': {
                        'session_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        'user': {
                            'id': 1,
                            'username': 'johndoe',
                            'email': 'john@example.com',
                            'first_name': 'John',
                            'last_name': 'Doe'
                        },
                        'message': 'Аутентификация успешна'
                    }
                }
            ),
            400: openapi.Response(
                description="Ошибка валидации",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING),
                        'code': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(type=openapi.TYPE_STRING)
                        )
                    }
                ),
                examples={
                    'application/json': {
                        'error': 'Неверный или просроченный код'
                    }
                }
            ),
            401: openapi.Response(
                description="Сессия истекла",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                ),
                examples={
                    'application/json': {
                        'error': 'Сессия истекла. Пожалуйста, войдите снова.'
                    }
                }
            )
        },
        tags=['Аутентификация'],
        security=[],
        manual_parameters=[],
        operation_id="verify_2fa_code"
    )
    def post(self, request):
        """
        Обработка POST запроса для верификации кода 2FA.
        
        Args:
            request: HTTP запрос с кодом подтверждения
            
        Returns:
            Response: JSON с результатом верификации
        """
        serializer = Verify2ACodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = request.session.get('2fa_user_id')
        if not user_id:
            return Response(
                {'error': 'Сессия истекла. Пожалуйста, войдите снова.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Пользователь не найден'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        code = serializer.validated_data['code']
        
        # Ищем действительный код
        verification_code = VerificationCode.objects.filter(
            user=user,
            code=code,
            is_used=False
        ).order_by('-created_at').first()
        
        if not verification_code or not verification_code.is_valid():
            return Response(
                {'error': 'Неверный или просроченный код'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Помечаем код как использованный
        verification_code.is_used = True
        verification_code.save()
        
        # Создаем или получаем токен
        # Предполагаем, что функция create_session существует
        # Если нет, замените на свою логику создания токена
        try:
            session_token = create_session(user.id)
        except NameError:
            # Если функция create_session не определена, используем альтернативный подход
            from django.contrib.auth import login
            from rest_framework.authtoken.models import Token
            
            # Создаем токен аутентификации
            token, created = Token.objects.get_or_create(user=user)
            session_token = token.key
            
            # Логиним пользователя в сессии Django
            login(request, user)
        
        # Очищаем сессию
        if '2fa_user_id' in request.session:
            del request.session['2fa_user_id']
        
        return Response({
            'session_token': session_token,
            'user': UserSerializer(user).data,
            'message': 'Аутентификация успешна'
        }, status=status.HTTP_200_OK)