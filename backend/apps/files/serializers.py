import os
from rest_framework import serializers
from .models import File

# Допустимые расширения файлов по типу
VALID_EXTENSIONS = {
    'article': ['.doc', '.docx', '.txt', '.rtf'],
    'plagiarism': ['.doc', '.docx', '.txt', '.rtf'],
    'payment': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
    'info_letter': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    'collection': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    'program': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class FileSerializer(serializers.ModelSerializer):
    """Сериализатор файла."""
    
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = ('id', 'application', 'type', 'file', 'original_name', 'file_url', 'uploaded_at')
        read_only_fields = ('id', 'file_url', 'uploaded_at')
    
    def get_file_url(self, obj):
        return obj.file.url if obj.file else None
    
    def validate_file(self, value):
        """Валидация файла по размеру и расширению."""
        # Проверка размера
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(f'Размер файла не должен превышать 10MB. Текущий размер: {value.size / 1024 / 1024:.2f}MB')
        
        # Проверка расширения
        ext = os.path.splitext(value.name)[1].lower()
        file_type = self.initial_data.get('type', 'article')
        
        if file_type in VALID_EXTENSIONS:
            if ext not in VALID_EXTENSIONS[file_type]:
                allowed = ', '.join(VALID_EXTENSIONS[file_type])
                raise serializers.ValidationError(
                    f'Недопустимое расширение для типа "{file_type}". Разрешённые: {allowed}'
                )
        
        return value


class FileUploadSerializer(serializers.Serializer):
    """Сериализатор для загрузки файла."""
    file = serializers.FileField()
    type = serializers.ChoiceField(choices=File.TYPE_CHOICES)
    
    def validate_file(self, value):
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(f'Размер файла не должен превышать 10MB')
        
        ext = os.path.splitext(value.name)[1].lower()
        file_type = self.initial_data.get('type', 'article')
        
        if file_type in VALID_EXTENSIONS:
            if ext not in VALID_EXTENSIONS[file_type]:
                allowed = ', '.join(VALID_EXTENSIONS[file_type])
                raise serializers.ValidationError(
                    f'Недопустимое расширение для типа "{file_type}". Разрешённые: {allowed}'
                )
        
        return value
