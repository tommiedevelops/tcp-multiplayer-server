#include <iostream>
#include <string>

#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <unistd.h>

#include <string.h>

#define DEFAULT_PROTOCOL (0)

int main()
{
	// Create a socket

	// allocate memory at the kernel level for a socket data-structure, initialize it depending
	// on the parameters and return the file descriptor. Sockets are files.
	// No connection exists yet. For TCP, the socket starts in CLOSED.

	int listening = socket(AF_INET, SOCK_STREAM, DEFAULT_PROTOCOL);

	if(listening == -1)
	{
		std::cerr << "Socket creation failed";
		return -1;
	}

	// This socket can be 'associated' with an 'address' belonging to a certain 'address family'
	// AF_INET  => struct sockaddr_in
	// AF_INET6 => struct sockaddr_in6
	// AF_UNIX  => struct sockaddr_un
	// etc.

	// Since we are using AF_INET (IPv4), let's initialize a sockaddr_in
	sockaddr_in hint; // IP address (host)
	hint.sin_family = AF_INET;

	constexpr uint16_t chosenPort = 54000;
	hint.sin_port = htons(chosenPort); // "host to network short"

	// This function converts a human readable IP Address ("X.X.X.X")
	// to a BINARY network-byte-order format. The reason why we do it now
	// is because interfacing with the kernel requires fixed-layout memory 
	// to be passed.

	// Converts numeric string to a fixed 4-byte binary value
	inet_pton(
		AF_INET, // Address Family
		"0.0.0.0", // Socket will listen to all possible network interfaces
		&hint.sin_addr // buffer to store result
	); 

	// bind() will write the address into the socket data structure. it will also store
	// the address in LUT in kernel memory for easy access when packets arrive
	int retVal = bind(listening, (sockaddr*)&hint, sizeof(hint));

	if (retVal == -1)
	{
		// Can fail if the address does not exist. There's only a couple of valid addys
		// it can either be a loop back or "any" or it can be the addy of a NIC
		std::cerr << "Can't bind to IP/Port\n";
		perror("bind failed");
		return -2;
	}
	
	// Transitions the TCP state from CLOSED to LISTENING.
	// It also allocates two queues: 
	//  - SYN queue (incomplete  'connection' queue)
	//  - Accept queue (complete 'connection' queue)
	// the 2nd arg is for the maximum number of pending connections allowed (size of queues)
	
	// Once in LISTENING mode, the kernel automatically handles the three-way handshake
	// When it receives a SYN, it creates a 'partial' connection and stores it in the SYN queue
	// Then, the kernel sends back a SYN-ACK
	// Once it receives an ACK, it promotes the 'partial' connection (request_sock) to a 'complete' connection
	// and moves it from the SYN queue to the ACCEPT queue

	// This step is not required for AF_INET + SOCK_DGRAM (UDP) because no connection state is
	// required by this protocol
	// if you try to listen() this type of socket, it will return -1 (fail)

	// When the NIC receives a packet, it triggers a hardware interrupt which is handled by the
	// kernel. The kernel then creates the relevant structures and does the above steps
	// This means that the kernel is essentially always listening for packets, it's not like the
	// current process is in some kind of listen loop. Marking an fd with listen() will essentially
	// tell the kernel that packets with this address can go to this socket

	// great info on the topic: https://www.alibabacloud.com/blog/tcp-syn-queue-and-accept-queue-overflow-explained_599203

	// a 'connection' is a small kernel data structure representing a TCP connection state
	// e.g.: 
	/*
	struct connection {
		4-tuple id = {localIP, localPort, remoteIP, remotePort},
		int localSequenceNumber, // both sides initial sequence number establishe during handshake
		int remoteSequenceNumber,
		int windowSize, // how much data the other side can receive
		float howLongSinceLastSYNACK,
		int listeningSocketFD
	};

	*/

	if( listen(listening, SOMAXCONN) == -1 )
	{
		std::cerr << "Can't listen";
		return -3;
	}

	// Sockaddr struct for storing client's remote address and port details
	sockaddr_in client;	
	socklen_t clientSize = sizeof(client);

	// buffers to put host and service name in (resolved by DNS)
	char host[NI_MAXHOST] = {0};
	char svc[NI_MAXSERV]  = {0};

	// When accept is called, the Accept queue for the provided socket fd is dequeued once
	// A new socket structure is allocated (new fd) which represents this specific connection
	// It then fills in the address information for the endpoint of the connection
	// The new fd is returned

	// If the Accept queue is empty, if the socket is in blocking mode, the process is put to sleep 
	// (put on a Wait queue) until a connection arrives
	
	// A non-blocking socket returns -1 immediately

	int clientSocket = accept(listening, (sockaddr*)&client, &clientSize);

	if( clientSocket == -1)
	{
		std::cerr << "Problem with client connecting";
		return -4;
	}
	
	// Close the listening socket. The listening socket was only ever there to get accept-queue
	// entries which is used to get the client address/port details
	// The socket retreived from accept() is what you use to read(), write(), send(), recv()

	// decrements kernel side refernece count
	// also removes the fd from the process' fd table
	// if count hits zero, kernel tears down the socket
	// In the case of TCP, tear down looks like this:
	// - unread data in RECV buffer => kernel may send RST instead of FIN
	// - usual: sends FIN to client and moves local TCP state from ESTABLISHED to FIN_WAIT_1
	// - then waits for client's ACK, which causes it to move to FIN_WAIT_2
	// - then the client's FIN, which causes it to send the final ACK

	// Note: the side that initiates the close (sends the first FIN) (in this case the server)
	// ends up in the TIME_WAIT state for 2xMaximum Segment Lifetime (30-120s). This:
	// - guarantees final ACK to get a chance to be retransmitted if lost
	// - prevents stray packets from dead connection being misinterpreted as belonging to a new
	// connection reusing the same 4-tuple

	// shutdown(fd, SHUT_WR)
	// is a function that operates on the connection itself. lets you send a FIN while still
	// being able to read remaining data from a peer
	
	// Note: TCP teardown happens asyncronously in kernel space
	close(listening);

	// A note on socket buffers
	// Every socket as two buffers: SO_RCVBUF, SO_SNDBUF
	// - When a packet is received and directed to this socket, the kernel writes to the RCVBUF
	//   after reassembling and reordering it
	// - If this buffer fills up, TCP flow control kicks in (kernel advertises shrinking recv
	//   window)
	// - recv() copies bytes out of this buffer into your userspace buffer and removes it from the
	//   buffer
	// - send()/write() copies data into the SNDBUF and returns immediately
	// the kernel then drains the SNDBUF and (presumably) constructs TCP packets in segements and
	// sends them to the client
	
	// The kernel's TCP implementation holds out-of-order segemtns intenrallty and only writes to 
	// the RECV buffer once all received in sequence


	// Notes:
	// - You may want to disable Nagle (TCP_NODELAY) which coalesces entries in the send buffer into
	// larger packets to reduce traffic - this may add latency to game
	// - if not calling recv() often enough, you're relying on receive buffer as a cushion
	// - TCP gives no message boundaries. Receive buffer contents may contain partial messages,
	// multiple or messages split across two recv() calls. So need explicit framing in application
	// protocol

	// Retrieves client's host and service strings via DNS lookup and something else to turn
	// port number into a name
	int result = getnameinfo((sockaddr*)&client,
							  clientSize, 
							  host,
							  NI_MAXHOST,
							  svc,
							  NI_MAXSERV,
							  0);


	if (result)
	{
		std::cout << "Was able to resolve the host and service name\n";
		std::cout << host << " connected on " << svc << std::endl;
	} else {
		std::cout << "Was NOT able to resolve the host and service name\n";
		inet_ntop(AF_INET, &client.sin_addr, host, NI_MAXHOST);
		std::cout << host << " connected on " << ntohs(client.sin_port) << std::endl;
	}

	const int BUF_SIZE{4096};
	char buf[BUF_SIZE];

	while(true)
	{
		// Clear the buffer
		memset(buf, 0x0, BUF_SIZE);

		// Wait for a message
		// pulls bytes out of the kernel's recv buffer for the socket into user space
		int bytesRecv = recv(clientSocket, buf, BUF_SIZE, 0);

		if ( bytesRecv == - 1)
		{
			std::cerr << "There was a connection issue" << std::endl;
			break;
		}

		if ( bytesRecv == 0 )
		{
			std::cout << "The client disconnected" << std::endl;
			break;
		}

		// Display message
		std::cout << "Received: " << std::string(buf, 0, bytesRecv) << std::endl;

		// Resend message
		send(clientSocket, buf, bytesRecv + 1, 0);

	}

	// Close the client's socket
	close(clientSocket);

	return 0;
}
