from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import random
import time
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

# Sample data for demonstration (in a real app, use a database)
students = [
    {
        "id": 1, 
        "name": "John Smith", 
        "email": "john.smith@university.edu",
        "course": "Computer Science", 
        "year": 3,
        "gpa": 3.8,
        "attendance": 95,
        "status": "Active",
        "enrollment_date": "2022-09-01"
    },
    {
        "id": 2, 
        "name": "Emma Johnson", 
        "email": "emma.johnson@university.edu",
        "course": "Electrical Engineering", 
        "year": 2,
        "gpa": 3.6,
        "attendance": 88,
        "status": "Active",
        "enrollment_date": "2023-09-01"
    },
    {
        "id": 3, 
        "name": "Michael Brown", 
        "email": "michael.brown@university.edu",
        "course": "Business Administration", 
        "year": 4,
        "gpa": 3.9,
        "attendance": 92,
        "status": "Active",
        "enrollment_date": "2021-09-01"
    },
    {
        "id": 4, 
        "name": "Sarah Davis", 
        "email": "sarah.davis@university.edu",
        "course": "Psychology", 
        "year": 1,
        "gpa": 3.4,
        "attendance": 85,
        "status": "Probation",
        "enrollment_date": "2024-01-15"
    }
]

courses = ["Computer Science", "Electrical Engineering", "Business Administration", "Psychology", "Biology", "Mathematics"]
years = [1, 2, 3, 4]

@app.route('/')
def home():
    # Calculate statistics
    total_students = len(students)
    active_students = len([s for s in students if s['status'] == 'Active'])
    average_gpa = round(sum(s['gpa'] for s in students) / len(students), 2) if students else 0
    average_attendance = round(sum(s['attendance'] for s in students) / len(students), 1) if students else 0
    
    stats = {
        'total_students': total_students,
        'active_students': active_students,
        'average_gpa': average_gpa,
        'average_attendance': average_attendance
    }
    
    return render_template('index.html', students=students, stats=stats)

@app.route('/students')
def student_list():
    return render_template('students.html', students=students, courses=courses, years=years)

@app.route('/add-student', methods=['POST'])
def add_student():
    if request.method == 'POST':
        new_student = {
            "id": len(students) + 1,
            "name": request.form.get('name'),
            "email": request.form.get('email'),
            "course": request.form.get('course'),
            "year": int(request.form.get('year')),
            "gpa": float(request.form.get('gpa')),
            "attendance": float(request.form.get('attendance')),
            "status": request.form.get('status'),
            "enrollment_date": request.form.get('enrollment_date')
        }
        students.append(new_student)
        return jsonify({'success': True, 'message': 'Student added successfully!'})
    
    return jsonify({'success': False, 'message': 'Failed to add student'})

@app.route('/edit-student/<int:student_id>', methods=['POST'])
def edit_student(student_id):
    student = next((s for s in students if s['id'] == student_id), None)
    if student:
        student.update({
            "name": request.form.get('name'),
            "email": request.form.get('email'),
            "course": request.form.get('course'),
            "year": int(request.form.get('year')),
            "gpa": float(request.form.get('gpa')),
            "attendance": float(request.form.get('attendance')),
            "status": request.form.get('status')
        })
        return jsonify({'success': True, 'message': 'Student updated successfully!'})
    
    return jsonify({'success': False, 'message': 'Student not found'})

@app.route('/delete-student/<int:student_id>', methods=['POST'])
def delete_student(student_id):
    global students
    students = [s for s in students if s['id'] != student_id]
    return jsonify({'success': True, 'message': 'Student deleted successfully!'})

@app.route('/analytics')
def analytics():
    # Course distribution
    course_distribution = {}
    for course in courses:
        count = len([s for s in students if s['course'] == course])
        course_distribution[course] = count
    
    # GPA distribution
    gpa_ranges = {'3.5-4.0': 0, '3.0-3.49': 0, '2.5-2.99': 0, '2.0-2.49': 0, 'Below 2.0': 0}
    for student in students:
        gpa = student['gpa']
        if gpa >= 3.5:
            gpa_ranges['3.5-4.0'] += 1
        elif gpa >= 3.0:
            gpa_ranges['3.0-3.49'] += 1
        elif gpa >= 2.5:
            gpa_ranges['2.5-2.99'] += 1
        elif gpa >= 2.0:
            gpa_ranges['2.0-2.49'] += 1
        else:
            gpa_ranges['Below 2.0'] += 1
    
    # Year distribution
    year_distribution = {1: 0, 2: 0, 3: 0, 4: 0}
    for student in students:
        year_distribution[student['year']] += 1
    
    return render_template('analytics.html', 
                         course_distribution=course_distribution,
                         gpa_ranges=gpa_ranges,
                         year_distribution=year_distribution)

@app.route('/api/student-stats')
def student_stats():
    total = len(students)
    active = len([s for s in students if s['status'] == 'Active'])
    probation = len([s for s in students if s['status'] == 'Probation'])
    
    return jsonify({
        'total': total,
        'active': active,
        'probation': probation
    })

if __name__ == '__main__':
    app.run(debug=True)