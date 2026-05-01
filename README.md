**Instructions to run**
1. Set up the backend using: [https://github.com/VEMURI-VENU-VITTAL/Dc_vr_real_collab_server/tree/development_v1.0](https://github.com/VEMURI-VENU-VITTAL/Dc_vr_real_collab_server/tree/development_v1.0)
2. Clone this repository and save it in your desired folder
3. Open the project in VS Code (or any preferred editor)
4. Run `npm install` to install dependencies (this creates the `node_modules` folder)
5. Create a `.env` file in the root directory and add:

  * `VITE_API_BASE=http://localhost:8080/realcollab/`
  * `VITE_WEBSOCKET_BASE=http://localhost:8080/realcollab/ws`
6. Run the application using `npm run dev`
7. Open the application in your browser at `http://localhost:5173`
