from django.urls import path
from .views import ResumeUploadView, InterviewAnswerEvaluateView

urlpatterns = [
    path("upload/", ResumeUploadView.as_view()),
    path("evaluate-answer/", InterviewAnswerEvaluateView.as_view()),
]