KISANSETU — QUEUE MANAGEMENT SYSTEM
====================================

PURPOSE
-------
The KisanSetu Queue Management System converts the physical procurement-centre queue into a digital, real-time, virtual queue.

The queue system must answer five questions for every farmer:

1. What is my token?
2. Where am I in the queue?
3. How long will I probably wait?
4. When should I travel to the centre?
5. What is happening to my procurement?

For the centre operator, the queue system must answer:

1. Who is next?
2. Who has arrived?
3. Who is being processed?
4. Who has been completed?
5. Who did not show up?
6. How overloaded is the centre?


CORE PRINCIPLE
--------------
There are three separate concepts:

SLOT
----
The expected arrival window.

Example:

10:00 AM - 12:00 PM

TOKEN
-----
The farmer's queue identifier.

Example:

A047

QUEUE
-----
The actual processing order.

Example:

A043
A044
A045
A046
A047


IMPORTANT:
A slot is NOT the same as a token.

A farmer books a slot first.

The system then creates a queue entry/token.

The queue determines actual processing order.


QUEUE SCOPE
-----------
A queue belongs to:

centre + date

Example:

Centre A + 26-Aug-2026

has its own queue.

Tomorrow:

Centre A + 27-Aug-2026

has a new queue.

Token numbers can restart each day.

Example:

26-Aug:
A001
A002
...
A047

27-Aug:
A001
A002
...


QUEUE ENTRY
-----------
Every booked farmer gets one queue entry.

Conceptually:

QueueEntry:

id
booking_id
farmer_id
centre_id
slot_id
queue_date
token_number
status
priority
arrival_time
check_in_time
called_at
processing_started_at
completed_at
created_at
updated_at


TOKEN GENERATION
----------------
When a booking is confirmed:

1. Identify centre.
2. Identify queue date.
3. Find the next available token sequence.
4. Generate token.
5. Create queue entry.
6. Return token to farmer.

Example:

Last token = A046

New booking:

Token = A047


IMPORTANT:
Token generation must happen safely on the backend/database.

Do NOT generate token numbers only in React.

Otherwise two farmers booking at nearly the same time could both receive A047.

The token-generation operation should be atomic.


BOOKING PROCESS
---------------
Farmer:

Select Centre
      ↓
Select Date
      ↓
Select Slot
      ↓
Confirm Booking
      ↓
Backend validates slot capacity
      ↓
Backend creates booking
      ↓
Backend creates queue entry
      ↓
Token assigned
      ↓
Farmer receives token


SLOT CAPACITY
-------------
Example:

Slot:
10:00 - 12:00

Capacity:
25

Booked:
21

Available:

25 - 21 = 4

If:

Booked >= Capacity

the slot cannot accept another booking.


QUEUE CAPACITY
--------------
Slot capacity and centre processing capacity are different concepts.

Example:

Centre daily capacity:
100 farmers

Slots:

08-10 → 20
10-12 → 25
12-14 → 25
14-16 → 30

Total:
100


QUEUE ORDER
-----------
For the MVP, queue ordering should primarily be:

1. Active status
2. Queue date
3. Priority
4. Scheduled slot time
5. Queue creation/token order

Simplified normal order:

A041
A042
A043
A044
A045

However, the actual "next farmer" should be selected from ACTIVE queue entries, not simply token number + 1.

This is important because:

A043 may be cancelled.

A044 may be no-show.

A045 may therefore become next.


ACTIVE QUEUE
------------
Active states can include:

CONFIRMED
APPROACHING
ARRIVED
CHECKED_IN
WAITING

PROCESSING is active but represents the current farmer.

Terminal states:

COMPLETED
CANCELLED
NO_SHOW
SKIPPED


QUEUE POSITION
--------------
Do not calculate position solely from:

token_number - current_token

because tokens can be cancelled/skipped.

Instead:

position =
number of eligible queue entries
ahead of the farmer

Example:

Queue:

A041 COMPLETED
A042 COMPLETED
A043 PROCESSING
A044 WAITING
A045 CANCELLED
A046 WAITING
A047 WAITING

For A047:

A044 = ahead
A045 = ignored because cancelled
A046 = ahead

Therefore:

2 farmers ahead.


CURRENT TOKEN
-------------
The centre has one active processing position.

Example:

current_processing = A043

This means:

A043 is currently being processed.

When procurement completes:

A043 → COMPLETED

Then:

A044 → PROCESSING


CALL NEXT
---------
"CALL NEXT" is the most important operator action.

It should NOT simply increment a number.

Bad logic:

current_token = current_token + 1

This fails when:

- A token is cancelled.
- A farmer is skipped.
- A farmer is absent.
- A token is rescheduled.

Correct concept:

1. Find current PROCESSING entry.
2. Complete or close it if appropriate.
3. Find next eligible queue entry.
4. Change that entry to PROCESSING/WAITING-CALLED state.
5. Record timestamp.
6. Recalculate queue positions.
7. Recalculate ETA.
8. Trigger notification.
9. Broadcast realtime update.


ATOMICITY
---------
The CALL NEXT operation should be atomic.

Why?

Imagine two centre operators click:

CALL NEXT

at almost the same time.

Without atomic logic:

Operator A → A044
Operator B → A044

This can corrupt the queue.

Therefore:

CALL NEXT

should be handled by one backend operation/transaction that locks or otherwise safely updates the relevant queue rows.


ARRIVAL
-------
A farmer may book a slot but arrive later.

When farmer arrives:

Operator selects farmer/token.

Click:

CHECK IN

State:

BOOKED/APPROACHING
        ↓
ARRIVED
        ↓
CHECKED_IN


IMPORTANT:
Checking in does not automatically mean the farmer is being processed.

It means the farmer has physically arrived.

They remain in the queue until their turn.


VIRTUAL → PHYSICAL QUEUE
-------------------------
KisanSetu has a hybrid model.

Before arrival:

FARMER
  ↓
Virtual queue

After arrival:

FARMER
  ↓
Physical presence
  +
Digital queue position

Therefore the system combines:

REMOTE WAITING
+
CENTRE CHECK-IN
+
DIGITAL PROCESSING QUEUE


APPROACHING STATE
-----------------
The system should calculate when a farmer's turn is sufficiently close.

Example:

5 farmers ahead
ETA = 50 minutes

Status:

WAITING

When:

2 farmers ahead

Status:

APPROACHING

Notification:

"Your turn is approaching."


ARRIVAL RECOMMENDATION
----------------------
A better version can calculate:

estimated_wait
+
travel_time

Example:

Estimated queue wait:
30 minutes

Travel time:
20 minutes

Recommended departure:

approximately now

This is a future enhancement.

For the prototype, use a simple threshold.

Example:

If:

people_ahead <= 3

then:

APPROACHING


ETA LOGIC
---------
ETA should be dynamic.

Basic:

ETA =
people_ahead
×
average_processing_time


Example:

People ahead = 5

Average processing time = 10 minutes

ETA = 50 minutes


ROLLING AVERAGE
---------------
A better calculation uses recent completed procurements.

Example:

Recent processing times:

8
11
9
13
10

Average:

10.2 minutes


ETA:

people_ahead × 10.2


For 5 people:

ETA ≈ 51 minutes


EDGE CASE:
No processing history.

Use centre's configured default.

Example:

average_processing_time = 10 minutes


ETA UPDATE
----------
ETA should be recalculated when:

- Farmer books
- Farmer cancels
- Farmer is skipped
- Farmer becomes no-show
- Farmer checks in
- Processing starts
- Procurement completes
- Processing time changes


NO-SHOW LOGIC
------------
Suppose:

Current = A046

A046 is called.

System starts a grace period.

Example:

5 minutes.

If farmer does not check in:

A046 → NO_SHOW

Then:

A047 → next eligible farmer

The farmer receives a notification.

For the prototype, this can be manually triggered by:

[MARK NO-SHOW]


SKIP LOGIC
----------
Operator can manually skip a farmer.

A047:

WAITING
  ↓
SKIPPED

A048 becomes next.

The reason can optionally be stored:

skip_reason

Examples:

Farmer not present
Documents unavailable
Centre issue
Farmer requested reschedule


CANCELLATION
------------
Before processing:

BOOKED → CANCELLED

Cancelled entries are excluded from queue-position calculations.

Example:

A047 CANCELLED

A048's position improves automatically.


RESCHEDULING
------------
Future enhancement.

A farmer can:

Cancel current booking
+
select another slot

Old queue entry:

RESCHEDULED

New booking:

new queue entry
new token


PROCESSING
----------
When farmer reaches the front:

WAITING
  ↓
PROCESSING

Operator records:

Crop
Quantity
Quality
Procurement rate
Amount


PROCESSING TIME
---------------
When processing begins:

processing_started_at = current time

When processing ends:

completed_at = current time

Then:

processing_time =
completed_at - processing_started_at

This value can be stored.

It contributes to future rolling-average ETA calculations.


PROCUREMENT COMPLETION
----------------------
PROCESSING
    ↓
COMPLETED

Then queue engine:

1. Records completion.
2. Calculates actual processing duration.
3. Updates average processing time.
4. Finds next eligible farmer.
5. Updates queue.
6. Sends notifications.
7. Recalculates positions and ETAs.


PAYMENT
-------
Procurement completion and payment completion are separate.

Example:

Queue:

COMPLETED

Procurement:

COMPLETED

Payment:

PENDING

Later:

Payment:

COMPLETED

This allows the farmer to track payment independently.


REALTIME
--------
Supabase Realtime should synchronize:

- Queue status
- Current token
- Farmer position
- Processing state
- Notifications

Example:

Centre operator:

CALL NEXT

Database:

A043 → COMPLETED
A044 → PROCESSING

Realtime event:

       ↓

Farmer screen:

Current token:
A044

People ahead:
2

ETA:
20 minutes


FARMER QUEUE SCREEN
-------------------
The farmer should see something like:

YOUR TOKEN
A047

CURRENT TOKEN
A044

POSITION
3rd

PEOPLE AHEAD
2

ESTIMATED WAIT
20 minutes

STATUS
Your turn is approaching.

[🔊 सुनें]


CENTRE QUEUE SCREEN
-------------------
Centre operator:

CURRENT TOKEN
A044

PROCESSING
A044 - Raj Kumar

NEXT
A045 - Harpreet Singh
A046 - Gurpreet Singh
A047 - Sukhwinder Singh

Actions:

[CALL NEXT]
[CHECK IN]
[SKIP]
[NO SHOW]


QUEUE EVENTS
------------
Every important queue transition should ideally be traceable.

Example:

queue_events

id
queue_entry_id
event_type
old_status
new_status
performed_by
timestamp
metadata

Events:

BOOKED
TOKEN_ASSIGNED
APPROACHING
ARRIVED
CHECKED_IN
CALLED
PROCESSING_STARTED
PROCESSING_COMPLETED
SKIPPED
NO_SHOW
CANCELLED
RESCHEDULED
NOTIFICATION_SENT

This is extremely useful for debugging and future auditability.


EXAMPLE EVENT HISTORY
---------------------
A047:

09:01 BOOKED
09:01 TOKEN_ASSIGNED
10:15 APPROACHING
10:20 ARRIVED
10:21 CHECKED_IN
10:28 CALLED
10:28 PROCESSING_STARTED
10:39 PROCESSING_COMPLETED
10:39 PROCUREMENT_COMPLETED
10:40 PAYMENT_PENDING
11:10 PAYMENT_COMPLETED


QUEUE STATE MACHINE
-------------------
                    BOOKED
                       |
                       v
                  CONFIRMED
                       |
                       v
                  APPROACHING
                       |
              +--------+--------+
              |                 |
              v                 v
          CANCELLED          ARRIVED
                                |
                                v
                           CHECKED_IN
                                |
                                v
                             WAITING
                                |
                   +------------+------------+
                   |                         |
                   v                         v
                SKIPPED                  PROCESSING
                                             |
                                             v
                                         COMPLETED
                                             |
                                             v
                                      PAYMENT PENDING
                                             |
                                             v
                                      PAYMENT COMPLETE


IMPORTANT BACKEND RULE
----------------------
The frontend should NEVER be trusted to determine:

- Who is next
- Token assignment
- Queue ordering
- ETA authority
- Procurement completion

The backend/database is the source of truth.

Frontend only requests actions.

Example:

Frontend:

CALL NEXT

Backend:

Validate operator
    ↓
Find current queue
    ↓
Find next eligible farmer
    ↓
Atomically update queue
    ↓
Create queue event
    ↓
Trigger notification
    ↓
Realtime broadcasts changes

Frontend:

Display updated state.


QUEUE CONSISTENCY RULES
-----------------------
Rule 1:
Only one farmer can be PROCESSING at a centre at a time.

Rule 2:
Cancelled/NO_SHOW/SKIPPED entries do not count as waiting.

Rule 3:
Completed entries do not count as waiting.

Rule 4:
A farmer cannot have two active queue entries for the same centre/date unless explicitly rescheduled.

Rule 5:
Token numbers are unique within a centre/date.

Rule 6:
CALL NEXT must be atomic.

Rule 7:
Queue state transitions must be validated.

Rule 8:
Only authorized centre operators can control their centre's queue.

Rule 9:
Farmer can only view their own queue information.

Rule 10:
Admin can view all centre queues.


PROTOTYPE SIMPLIFICATION
------------------------
For the 5-day prototype:

Use:

- One or two demo centres
- One daily queue per centre
- Sequential tokens
- Manual CALL NEXT
- Manual CHECK IN
- Manual SKIP/NO-SHOW
- Rolling average ETA
- Supabase Realtime
- Simulated notifications

Do NOT build complicated scheduling algorithms yet.


THE IDEAL DEMO
--------------
Start:

Centre current token:
A043

Farmer:
A047

Farmer screen:

A047
3 farmers ahead
ETA: 30 min


Centre operator clicks:

CALL NEXT

Database:

A043 → COMPLETED
A044 → PROCESSING

Realtime:

Farmer screen changes automatically:

A047
2 farmers ahead
ETA: 20 min


CALL NEXT

A045 → PROCESSING

Farmer:

A047
1 farmer ahead
ETA: 10 min


CALL NEXT

A046 → PROCESSING

Farmer:

A047
YOUR TURN IS NEXT

Notification:

"कृपया खरीद केंद्र पर पहुँचें।"


CALL NEXT

A047 → PROCESSING

Farmer:

"आपकी बारी आ गई है।"


Centre:

START PROCUREMENT

Quantity:
420 kg

Quality:
A

Complete.

Queue:

A047 → COMPLETED

Payment:

PENDING


Later:

Payment:

COMPLETED


END RESULT
----------
The queue system must make the farmer feel:

"I don't have to stand in the queue blindly. I know my position, I know approximately how long I will wait, I know when I should come to the centre, and I can see what happens after my turn."

The centre operator should feel:

"I have one controlled digital queue instead of manually managing a crowd."

The administrator should feel:

"I can see what is happening across procurement centres in real time."