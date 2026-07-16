#include <iostream>
#include <string>

#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>

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
	sockaddr_in hint;
	hint.sin_family = AF_INET;
	hint.sin_port = htons(54000); // "host to network short"
	inet_pton(AF_INET, "0.0.0.0", &hint.sin_addr); // converts a number into an array of integers

	if( bind(AF_INET, (sockaddr*)&hint, sizeof(hint)) == -1 )
	{
		std::cerr << "Can't bind to IP/Port";
		return -2;
	}

	// Mark the socket for listening
	if( listen(listening, SOMAXCONN) == -1 )
	{
		std::cerr << "Can't listen";
		return -3;
	}

	// Accept a call
	// Close the listening socket
	// While receiving, display message, echo message
	// Close socket
	return 0;
}
