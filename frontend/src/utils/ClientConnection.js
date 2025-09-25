class ClientConnection {
  constructor(gameCode, playerTag, teamColor) {
    this.gameCode = gameCode;
    this.playerTag = playerTag;
    this.teamColor = teamColor;
    this.socket = null;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `ws://localhost:4000/battle/${this.gameCode}?player=${this.playerTag}&color=${this.teamColor}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('🔗 Connected to battle arena');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.socket.onclose = (event) => {
          this.handleDisconnection(event);
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  handleMessage(message) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  handleDisconnection(event) {
    console.log(`Connection closed: ${event.code} - ${event.reason}`);
    
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    }
  }

  sendCommand(action, data = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action, ...data }));
      return true;
    }
    return false;
  }

  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
    }
  }

  // Specific command methods
  shoot(weaponType, targetColor) {
    return this.sendCommand('shoot', { weapon: weaponType, targetColor });
  }

  purchase(itemType) {
    return this.sendCommand('purchase', { item: itemType });
  }

  startBattle() {
    return this.sendCommand('startBattle');
  }
}

export default ClientConnection;