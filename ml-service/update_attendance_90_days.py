#!/usr/bin/env python3
"""
Script to update attendance with 90 more days of attendance records
"""

import sqlite3
import random
from datetime import datetime, timedelta
from dateutil import parser

def update_attendance_90_days():
    """Add 90 days of attendance records and update student aggregates"""
    
    # Connect to database
    conn = sqlite3.connect('../prisma/dev.db')
    cursor = conn.cursor()
    
    try:
        # Get all students
        cursor.execute("SELECT id, name, rollNo, department FROM students")
        students = cursor.fetchall()
        
        print(f"Found {len(students)} students")
        
        # Get the latest attendance date for each student
        latest_dates = {}
        for student_id, name, rollNo, department in students:
            cursor.execute("""
                SELECT MAX(date) FROM attendance 
                WHERE studentId = ?
            """, (student_id,))
            result = cursor.fetchone()
            latest_timestamp = result[0]
            
            if latest_timestamp and latest_timestamp > 0:
                # Convert Unix timestamp to datetime
                latest_dates[student_id] = datetime.fromtimestamp(latest_timestamp / 1000)  # Divide by 1000 if milliseconds
            else:
                latest_dates[student_id] = None
        
        # Generate attendance for 90 more days
        added_records = 0
        today = datetime.now()
        
        for student_id, name, rollNo, department in students:
            latest_date = latest_dates[student_id]
            
            if latest_date:
                # Start from the day after the latest record
                start_date = latest_date + timedelta(days=1)
            else:
                # If no previous records, start from 90 days ago
                start_date = today - timedelta(days=90)
            
            # Generate attendance records from start_date to today
            current_date = start_date
            
            while current_date <= today:
                # Skip weekends (Saturday, Sunday)
                if current_date.weekday() >= 5:
                    current_date += timedelta(days=1)
                    continue
                
                # Random attendance status with realistic distribution
                rand = random.random()
                if rand < 0.75:  # 75% present
                    status = 'Present'
                elif rand < 0.90:  # 15% late
                    status = 'Late'
                else:  # 10% absent
                    status = 'Absent'
                
                # Insert attendance record
                timestamp = int(current_date.timestamp() * 1000)  # Convert to milliseconds
                cursor.execute("""
                    INSERT INTO attendance (
                        id, studentId, studentName, date, status, 
                        subject, markedBy, markedByTeacher, createdAt, updatedAt
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                """, (
                    f"att_{student_id}_{current_date.strftime('%Y%m%d')}",
                    student_id,
                    name,
                    timestamp,  # Use timestamp instead of ISO string
                    status,
                    "General",  # Default subject
                    "System",   # Marked by system
                    "System Update",  # Teacher name
                    timestamp,  # Use timestamp for createdAt
                    timestamp   # Use timestamp for updatedAt
                ))
                
                added_records += 1
                current_date += timedelta(days=1)
        
        # Now update student aggregate attendance fields
        print("Updating student aggregate attendance fields...")
        
        for student_id, name, rollNo, department in students:
            # Get all attendance records for this student
            cursor.execute("""
                SELECT status FROM attendance 
                WHERE studentId = ?
            """, (student_id,))
            attendance_records = cursor.fetchall()
            
            if attendance_records:
                total_days = len(attendance_records)
                present_days = sum(1 for (status,) in attendance_records if status == 'Present')
                absent_days = sum(1 for (status,) in attendance_records if status == 'Absent')
                late_days = sum(1 for (status,) in attendance_records if status == 'Late')
                
                # Calculate attendance percentage (present + late counted as present)
                attendance_percentage = ((present_days + late_days) / total_days * 100) if total_days > 0 else 0
                
                # Update student record
                cursor.execute("""
                    UPDATE students 
                    SET attendance = ?, presentDays = ?, absentDays = ?, lateDays = ?
                    WHERE id = ?
                """, (attendance_percentage, present_days, absent_days, late_days, student_id))
        
        # Commit all changes
        conn.commit()
        
        print(f"✅ Successfully added {added_records} attendance records")
        print(f"✅ Updated attendance aggregates for {len(students)} students")
        
        # Show sample of updated attendance
        cursor.execute("""
            SELECT name, rollNo, attendance, presentDays, absentDays, lateDays 
            FROM students 
            ORDER BY attendance DESC 
            LIMIT 10
        """)
        top_students = cursor.fetchall()
        
        print("\n📊 Top 10 students by attendance:")
        print("Name\t\tRoll No\tAttendance\tPresent\tAbsent\tLate")
        print("-" * 70)
        for name, rollNo, attendance, present, absent, late in top_students:
            print(f"{name[:15]}\t{rollNo}\t{attendance:.1f}%\t\t{present}\t{absent}\t{late}")
        
    except Exception as e:
        print(f"❌ Error updating attendance: {e}")
        conn.rollback()
    
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Starting attendance update for 90 days...")
    update_attendance_90_days()
    print("✅ Attendance update completed!")
