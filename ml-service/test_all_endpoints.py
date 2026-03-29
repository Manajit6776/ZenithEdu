import requests
import json

def test_all_analytics_endpoints():
    """Test all analytics endpoints"""
    base_url = "http://localhost:8000"
    
    endpoints = [
        ("/analytics/overview", "Analytics Overview"),
        ("/analytics/performance-trends", "Performance Trends"),
        ("/analytics/department-stats", "Department Statistics"),
        ("/analytics/top-performers", "Top Performers"),
        ("/analytics/at-risk-students", "At-Risk Students"),
        ("/api/student-performance-stats", "Student Performance Stats"),
        ("/health", "Health Check")
    ]
    
    print("🔍 Testing All Analytics Endpoints")
    print("=" * 50)
    
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {description}")
                print(f"   Endpoint: {endpoint}")
                
                if endpoint == "/analytics/overview":
                    print(f"   Total Students: {data.get('totalStudents', 0)}")
                    print(f"   Risk Distribution: {data.get('riskDistribution', {})}")
                elif endpoint == "/analytics/department-stats":
                    departments = data.get('departments', [])
                    print(f"   Departments: {len(departments)}")
                    for dept in departments[:3]:  # Show first 3
                        print(f"     - {dept['department']}: {dept['studentCount']} students")
                elif endpoint == "/analytics/top-performers":
                    students = data.get('students', [])
                    print(f"   Top Performers: {len(students)}")
                    for student in students[:3]:  # Show first 3
                        print(f"     - {student['name']}: CGPA {student['cgpa']}")
                elif endpoint == "/analytics/at-risk-students":
                    students = data.get('students', [])
                    print(f"   At-Risk Students: {len(students)}")
                    for student in students[:3]:  # Show first 3
                        print(f"     - {student['name']}: {student['riskFactors']}")
                elif endpoint == "/analytics/performance-trends":
                    trends = data.get('trends', [])
                    print(f"   Trends: {len(trends)} months")
                elif endpoint == "/api/student-performance-stats":
                    print(f"   Model Trained: {data.get('model_trained', False)}")
                    print(f"   Risk Distribution: {data.get('risk_distribution', {})}")
                elif endpoint == "/health":
                    print(f"   Status: {data.get('status', 'unknown')}")
                    print(f"   Model Trained: {data.get('model_trained', False)}")
                
                print()
            else:
                print(f"❌ {description} - Status: {response.status_code}")
                print()
        except Exception as e:
            print(f"❌ {description} - Error: {e}")
            print()
    
    print("🎉 All Analytics Endpoints Test Complete!")

if __name__ == "__main__":
    test_all_analytics_endpoints()
