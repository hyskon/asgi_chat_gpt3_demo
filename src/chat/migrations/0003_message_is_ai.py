# Generated by Django 4.1.5 on 2023-01-27 13:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_message_content'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='is_ai',
            field=models.BooleanField(default=False),
        ),
    ]
