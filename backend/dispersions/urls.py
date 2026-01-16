from django.urls import path
from .views import UploadExcelView, GenerateDispersionView

urlpatterns = [
    path('upload-excel/', UploadExcelView.as_view(), name='upload-excel'),
    path('generate-dispersion/', GenerateDispersionView.as_view(), name='generate-dispersion'),
]
