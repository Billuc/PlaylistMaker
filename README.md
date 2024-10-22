# PlaylistMaker

A showcase project to demonstrate how to build a fullstack project using Glitr, Lustre & Wisp

## Launch the project

To launch the project, you have to :

1. Build the frontend : `(cd client && gleam run -m lustre/dev build --outdir=../server/priv/static)`
2. Launch the server : `(cd server && gleam run)`

## Main dependencies

Many tools and libraries are used in this project. Here is a list of the main ones : 

- Glitr and its derivated libraries (glitr_lustre, glitr_wisp, glitr_convert, glitr_convert_cake)
- Lustre for the frontend
- Wisp for the HTTP server
- Cake for creating the SQL queries
- gleam_pgo for interacting with the database
- lucide_lustre for the icons
- plinth for accessing JS APIs
- modem for frontend routing
- lustre_http for making requests

## Organization of the code

The project is divided into 3 gleam projects : 

- [client] contains the code for the Lustre frontend
- [server] contains the code relative to the Wisp backend
- [shared] contains code used by both such as common types and Glitr routes
