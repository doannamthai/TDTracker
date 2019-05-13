    
	'* Set Arguments 
	set Args = Wscript.Arguments
	If Args.count < 5 Then
		wscript.quit(1)
	End If
	brand = Args(0)
	barcode = Args(1)
	price = Args(2)
	copies = CInt(Args(3))
	layoutLocation = Args(4)
	
	Wscript.Echo "Copies" & copies
	DoPrint layoutLocation, brand, barcode, price, copies
	Wscript.Echo ReturnDone
	Wscript.quit

	'
	'*******************************************************************
	'	Print Module
	'*******************************************************************
	
	Sub DoPrint(layoutLocation, brand, barcode, price, copies)
		Set ObjDoc = CreateObject("bpac.Document")
		bRet = ObjDoc.Open(layoutLocation)
		If (bRet <> False) Then
			ObjDoc.SetBarcodeData 0, barcode
			ObjDoc.GetObject("price").Text = price
			ObjDoc.StartPrint "", 0
			ObjDoc.PrintOut copies, 0
			Wscript.Echo ObjDoc.ErrorCode			
			ObjDoc.EndPrint
			ObjDoc.Close
		End If
		Wscript.Echo ReturnStatus(bRet)
		Set ObjDoc = Nothing
	End Sub

	Function ReturnStatus(bRet)
		If (bRet <> False) Then
			ReturnStatus = "#TDManager: True"
		Else
			ReturnStatus = "#TDManager: False" 
		End If
	End Function

	Function ReturnDone
		ReturnDone = "#TDManager: Done"
	End Function
