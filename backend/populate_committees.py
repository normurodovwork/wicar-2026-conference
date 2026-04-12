import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.committees.models import Committee, CommitteeMember

# Данные для Организационного комитета
org_committee_data = {
    'type': 'organizing',
    'name': 'Организационный комитет',
    'description': '',
    'order': 1,
    'members': [
        {
            'full_name': 'Sodyq Safoev',
            'role': 'chairman',
            'position': 'First Deputy Chairman of the Senate, Rector of UWED',
            'photo': 'https://picsum.photos/seed/chairman-org/300/300',
            'order': 1,
        },
        {
            'full_name': 'Gulnoza Ismailova',
            'role': 'vice',
            'position': 'Vice-Rector for Science and Innovation, UWED',
            'order': 2,
        },
        {
            'full_name': 'Akram Umarov',
            'role': 'vice',
            'position': 'Deputy Director of the IAIS',
            'order': 3,
        },
        {
            'full_name': 'Durbek Amanov',
            'role': 'vice',
            'position': 'Director of the IAIS',
            'order': 4,
        },
        {
            'full_name': 'Olimjon Tuychiev',
            'role': 'vice',
            'position': 'Director of the Agency for Innovative Development',
            'order': 5,
        },
        {
            'full_name': 'Mansur Gulyamov',
            'role': 'member',
            'position': 'IAIS Senior Fellow',
            'order': 6,
        },
        {
            'full_name': 'Rustam Kayumov',
            'role': 'member',
            'position': 'Head of Department, UWED',
            'order': 7,
        },
        {
            'full_name': 'Nodira Gafurova',
            'role': 'member',
            'position': 'Associate Professor, UWED',
            'order': 8,
        },
        {
            'full_name': 'Azizbek Khonkhodjaev',
            'role': 'member',
            'position': 'Senior Lecturer, UWED',
            'order': 9,
        },
        {
            'full_name': 'Dilnoza Sultanova',
            'role': 'member',
            'position': 'Researcher, IAIS',
            'order': 10,
        },
        {
            'full_name': 'Jamshid Abdullaev',
            'role': 'member',
            'position': 'Expert, UWED',
            'order': 11,
        },
    ]
}

# Данные для Программного комитета
prog_committee_data = {
    'type': 'program',
    'name': 'Программный комитет',
    'description': '',
    'order': 2,
    'members': [
        {
            'full_name': 'Sherzod Abdullaev',
            'role': 'chairman',
            'position': 'Professor, Head of Department of International Relations',
            'photo': 'https://picsum.photos/seed/chairman-prog/300/300',
            'order': 1,
        },
        {
            'full_name': 'Alisher Fayzullaev',
            'role': 'vice',
            'position': 'Professor, IAIS Senior Fellow',
            'order': 2,
        },
        {
            'full_name': 'Etibor Sultanova',
            'role': 'vice',
            'position': 'Head of Department of Social and Political Sciences',
            'order': 3,
        },
        {
            'full_name': 'Ulugbek Khasanov',
            'role': 'vice',
            'position': 'Professor, IAIS Fellow',
            'order': 4,
        },
        {
            'full_name': 'Farkhod Tolipov',
            'role': 'vice',
            'position': 'Director of Knowledge Caravan',
            'order': 5,
        },
        {
            'full_name': 'Bakhtiyor Ergashev',
            'role': 'member',
            'position': "Director of Ma'no Center",
            'order': 6,
        },
        {
            'full_name': 'Anvar Nazirov',
            'role': 'member',
            'position': 'Independent Expert',
            'order': 7,
        },
        {
            'full_name': 'Kamola Alieva',
            'role': 'member',
            'position': 'Associate Professor, UWED',
            'order': 8,
        },
        {
            'full_name': 'Sardorbek Usmanov',
            'role': 'member',
            'position': 'Senior Researcher, IAIS',
            'order': 9,
        },
        {
            'full_name': 'Nilufar Rakhimova',
            'role': 'member',
            'position': 'Lecturer, UWED',
            'order': 10,
        },
        {
            'full_name': 'Sherzodbek Khaydarov',
            'role': 'member',
            'position': 'Expert, IAIS',
            'order': 11,
        },
    ]
}


def populate_committees():
    """Заполняет базу данных комитетами и их членами."""
    
    for committee_data in [org_committee_data, prog_committee_data]:
        committee, created = Committee.objects.get_or_create(
            type=committee_data['type'],
            defaults={
                'name': committee_data['name'],
                'description': committee_data['description'],
                'order': committee_data['order'],
            }
        )
        
        if created:
            print(f'Создан комитет: {committee.name}')
        else:
            print(f'Комитет уже существует: {committee.name}')
        
        # Добавляем членов комитета
        for member_data in committee_data['members']:
            member, member_created = CommitteeMember.objects.get_or_create(
                committee=committee,
                full_name=member_data['full_name'],
                defaults={
                    'role': member_data['role'],
                    'position': member_data['position'],
                    'photo': member_data.get('photo'),
                    'order': member_data['order'],
                }
            )
            
            if member_created:
                print(f'  Добавлен член комитета: {member.full_name} ({member.get_role_display()})')
            else:
                print(f'  Член комитета уже существует: {member.full_name}')
    
    print('\nГотово! Комитеты заполнены.')


if __name__ == '__main__':
    populate_committees()
