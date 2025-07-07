PS D:\Sigma_WebDev\SongGeet> cd D:\Sigma_WebDev\SongGeet
PS D:\Sigma_WebDev\SongGeet> Move-Item -LiteralPath .\songs -Destination .\public\songs -Force
Move-Item : Access to the path 'D:\Sigma_WebDev\SongGeet\songs' is denied.
At line:1 char:1
+ Move-Item -LiteralPath .\songs -Destination .\public\songs -Force
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : WriteError: (D:\Sigma_WebDev\SongGeet\songs:DirectoryInfo) [Move-Item], IOException
    + FullyQualifiedErrorId : MoveDirectoryItemIOError,Microsoft.PowerShell.Commands.MoveItemCommand

PS D:\Sigma_WebDev\SongGeet>