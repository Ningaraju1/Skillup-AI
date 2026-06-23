from django.urls import path
from .views import ResumeUploadView, InterviewAnswerEvaluateView, ResumeListView

urlpatterns = [
    path("upload/", ResumeUploadView.as_view()),
    path("evaluate-answer/", InterviewAnswerEvaluateView.as_view()),
    path("history/", ResumeListView.as_view()),
]