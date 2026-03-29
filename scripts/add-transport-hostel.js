import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTransportAndHostel() {
  console.log('Adding bus routes and hostel rooms...');

  // Create Bus Routes
  const busRoutes = [
    {
      routeNumber: 'R001',
      destination: 'Downtown Campus',
      driver: 'John Davis',
      departureTime: '08:00 AM',
      status: 'OnTime',
    },
    {
      routeNumber: 'R002',
      destination: 'North Campus',
      driver: 'Michael Smith',
      departureTime: '08:15 AM',
      status: 'OnTime',
    },
    {
      routeNumber: 'R003',
      destination: 'South Campus',
      driver: 'Robert Johnson',
      departureTime: '08:30 AM',
      status: 'Delayed',
    },
    {
      routeNumber: 'R004',
      destination: 'East Campus',
      driver: 'William Brown',
      departureTime: '07:45 AM',
      status: 'OnTime',
    },
    {
      routeNumber: 'R005',
      destination: 'West Campus',
      driver: 'James Wilson',
      departureTime: '08:00 AM',
      status: 'Departed',
    },
  ];

  for (const route of busRoutes) {
    try {
      await prisma.busRoute.create({
        data: route,
      });
      console.log(`Created bus route: ${route.routeNumber} - ${route.destination}`);
    } catch (error) {
      console.log(`Bus route ${route.routeNumber} already exists`);
    }
  }

  // Create Hostel Rooms
  const hostelRooms = [
    {
      number: 'A101',
      type: 'Single',
      capacity: 1,
      occupied: 1,
      floor: 1,
      status: 'Full',
      fee: 5000,
    },
    {
      number: 'A102',
      type: 'Single',
      capacity: 1,
      occupied: 0,
      floor: 1,
      status: 'Available',
      fee: 5000,
    },
    {
      number: 'B201',
      type: 'Double',
      capacity: 2,
      occupied: 2,
      floor: 2,
      status: 'Full',
      fee: 3000,
    },
    {
      number: 'B202',
      type: 'Double',
      capacity: 2,
      occupied: 1,
      floor: 2,
      status: 'Available',
      fee: 3000,
    },
    {
      number: 'C301',
      type: 'Shared',
      capacity: 4,
      occupied: 3,
      floor: 3,
      status: 'Available',
      fee: 2000,
    },
  ];

  for (const room of hostelRooms) {
    try {
      await prisma.hostelRoom.create({
        data: room,
      });
      console.log(`Created hostel room: ${room.number}`);
    } catch (error) {
      console.log(`Hostel room ${room.number} already exists`);
    }
  }

  console.log('Bus routes and hostel rooms added successfully!');
}

addTransportAndHostel()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
