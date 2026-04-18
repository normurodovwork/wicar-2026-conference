from django.apps import AppConfig


class FilesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.files'
    label = 'files'

    def ready(self):
        """Импортируем signals при загрузке приложения."""
        import apps.files.signals  # noqa
