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
	int listening = socket(AF_INET, SOCK_STREAM, DEFAULT_PROTOCOL);

	if(listening == -1)
	{
		std::cerr << "Socket creation failed";
		return -1;
	}

	// Bind the socket to an IP / port
	sockaddr_in hint; // IP address (host)
	hint.sin_family = AF_INET;
	hint.sin_port = htons(54000); // "host to network short"

	inet_pton( // converts numeric str to an arr of numbers
		AF_INET, // protocol
		"0.0.0.0", // any ip addres
		&hint.sin_addr // buffer to store result
	); 

	if( bind(listening, (sockaddr*)&hint, sizeof(hint)) == -1 )
	{
		std::cerr << "Can't bind to IP/Port\n";
		return -2;
	}

	// Mark the socket for listening
	if( listen(listening, SOMAXCONN) == -1 )
	{
		std::cerr << "Can't listen";
		return -3;
	}

	// Accept a call
	sockaddr_in client;	
	socklen_t clientSize = sizeof(client);

	// buffers to put host and service name in
	char host[NI_MAXHOST] = {0};
	char svc[NI_MAXSERV]  = {0};

	int clientSocket = accept(listening, (sockaddr*)&client, &clientSize);

	if( clientSocket == -1)
	{
		std::cerr << "Problem with client connecting";
		return -4;
	}
	
	// Close the listening socket
	close(listening);

	int result = getnameinfo((sockaddr*)&client,
							  clientSize, 
							  host,
							  NI_MAXHOST,
							  svc,
							  NI_MAXSERV,
							  0);

	if (result)
	{
			std::cout << host << " connected on " << svc << std::endl;
	} else {
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
