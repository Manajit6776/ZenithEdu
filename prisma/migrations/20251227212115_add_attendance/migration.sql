-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "department" TEXT DEFAULT '',
    "specialization" TEXT DEFAULT '',
    "experience" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "attendance" REAL NOT NULL DEFAULT 0,
    "cgpa" REAL NOT NULL DEFAULT 0,
    "feesStatus" TEXT NOT NULL DEFAULT 'Pending',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "author" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notices_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "progress" REAL NOT NULL DEFAULT 0,
    "instructorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "courses_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "course_students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_students_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "course_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "coverUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hostel_rooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Single',
    "capacity" INTEGER NOT NULL,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "floor" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "fee" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bus_routes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeNumber" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OnTime',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "fee_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "invoiceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fee_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "live_classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "duration" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Upcoming',
    "platform" TEXT NOT NULL DEFAULT 'Zoom',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Present',
    "subject" TEXT NOT NULL,
    "markedBy" TEXT NOT NULL,
    "markedByTeacher" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_rollNo_key" ON "students"("rollNo");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "course_students_courseId_studentId_key" ON "course_students"("courseId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_rooms_number_key" ON "hostel_rooms"("number");

-- CreateIndex
CREATE UNIQUE INDEX "bus_routes_routeNumber_key" ON "bus_routes"("routeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "fee_records_invoiceId_key" ON "fee_records"("invoiceId");
