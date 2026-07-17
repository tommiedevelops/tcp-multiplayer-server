#include <iostream>
#include <string>

#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <unistd.h>

#include <string.h>

int main()
{
    // Create a socket
    int sock = socket(AF_INET, SOCK_STREAM, 0);

    if (sock == -1)
    {
        std::cout << "Socket creation failed\n";
        return -1;
    }

    // Create a hint structure for the server we're connecting with
    // information needed to connect to the server

    int port = 54'000;
    std::string ipAddress {"127.0.0.1"};
    
    sockaddr_in hint;
    hint.sin_family = AF_INET;
    hint.sin_port   = htons(port);
    inet_pton(AF_INET, ipAddress.c_str(), &hint.sin_addr);

    // Connect to the server on the socket
    int connectRes = connect(sock, (sockaddr*)&hint, sizeof(hint));

    if(connectRes == -1) 
    {
        std::cout << "Connection failed\n";
        return -2;
    }

    char buf[4096];
    std::string userInput{};

    do {
        std::cout << "> ";
        getline(std::cin, userInput);

        // Send to the server
        int sendRes = send(sock, userInput.c_str(), userInput.size() + 1, 0);
        
        if(sendRes == -1)
        {
            std::cout << "Could not send to server!\r\n";
            continue;
        }

        memset(buf, 0x0, 4096);

        int bytesRecv = recv(sock, buf, 4096, 0);

        // Display Response
        std::cout << "SERVER> " << std::string(buf) << "\r\n";

    } while(true);

    close(sock);

    return 0;
}