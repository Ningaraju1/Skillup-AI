from django.db import models

class Resume(models.Model):
    resume_file = models.FileField(upload_to="resumes/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

        # NEW FIELDS
    skills = models.JSONField(null=True, blank=True)
    ats_score = models.JSONField(null=True, blank=True)
    improvements = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Resume {self.id}"