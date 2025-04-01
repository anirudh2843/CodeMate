## DevTinder API Documentation

### Authentication Routes (authRouter)

- **POST** `/signup` - Register a new user.
- **POST** `/login` - Authenticate user and generate a token.
- **POST** `/logout` - Logout the user and invalidate the session.

### Profile Routes (profileRouter)

- **GET** `/profile/view` - View user profile details.
- **PATCH** `/profile/edit` - Edit user profile information.
- **PATCH** `/profile/password` - Update or reset password (Forgot password API).

### Connection Request Routes (connectionRequestRouter)

- **POST** `/request/send/:status/:userId` - Send a connection request with a status.
- **POST** `/request/review/:status/:requestId` - Review a received connection request.

### User Routes (userRouter)

- **GET** `/user/requests/received` - Get received connection requests.
- **GET** `/user/connections` - Get a list of connected users.
- **GET** `/user/feed` - Retrieve profiles of other users on the platform.

### Status Definitions

- **ignored** - Request was ignored.
- **interested** - User is interested in the connection.
- **accepted** - Connection request accepted.
- **rejected** - Connection request rejected.
