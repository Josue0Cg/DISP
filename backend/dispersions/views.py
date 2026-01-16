from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import pandas as pd

class UploadExcelView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, format=None):
        if 'file' not in request.data:
            return Response({'error': 'No file provided'}, status=400)

        file_obj = request.data['file']
        
        try:
            # Read Excel file
            df = pd.read_excel(file_obj)
            
            # Convert to object to allow None values (fixes JSON nan error)
            df = df.astype(object)
            
            # Replace NaN with None (null in JSON)
            df = df.where(pd.notnull(df), None)
            
            # Convert to list of dictionaries
            data = df.to_dict(orient='records')
            
            # Get columns for the frontend table headers
            columns = list(df.columns)
            
            return Response({
                'columns': columns,
                'data': data,
                'message': 'File processed successfully'
            })
        except Exception as e:
            print(f"Error uploading file: {e}")
            return Response({'error': str(e)}, status=500)

from .utils import generate_txt_content, validate_beneficiary
from django.http import HttpResponse
from datetime import datetime
import json

class GenerateDispersionView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            # Expecting structure:
            # {
            #   "header": { ... },
            #   "charges": [ { ..., "details": [...] } ]
            # }
            # Or flat mapped data that we need to structure.
            # Based on user request, they map columns. So frontend will send structured data.
            
            header_data = data.get('header')
            charges_data = data.get('charges', [])
            # For this specific flow, likely 1 charge per file, but support multiple if needed.
            # The structure implies we need to organize details under charges.
            
            # Flatten details for generation if needed, or pass structured.
            # Our utils.generate_txt_content expects: header, charges_list, details_list (flat with charge_index)
            
            # Let's assume frontend sends:
            # header: { ... }
            # charge: { ... } (Single charge for now as per typical use case, or list)
            # details: [ ... ] (List of mapped rows)
            
            # We need to construct the data for the util.
            # If the user maps columns, the 'details' array will contain the rows from Excel with mapped keys.
            
            details = data.get('details', [])
            charge = data.get('charge') # The single charge account info provided by user input
            
            # We need to link details to the charge.
            # Assign charge_index = 0 to all details for this single charge scenario.
            for d in details:
                d['charge_index'] = 0
                
            charges = [charge]
            charge['index'] = 0
            
            # Transform date from YYYY-MM-DD to YYMMDD
            if 'payment_date' in header_data:
                try:
                    # Parse YYYY-MM-DD
                    date_obj = datetime.strptime(header_data['payment_date'], '%Y-%m-%d')
                    header_data['payment_date'] = date_obj.strftime('%y%m%d')
                except ValueError:
                    # Handle case where it might already be in other format or empty
                    pass

            # Generate content
            txt_content = generate_txt_content(header_data, charges, details)
            
            response = HttpResponse(txt_content, content_type='text/plain')
            response['Content-Disposition'] = f'attachment; filename="dispersion_{header_data["sequential"]}.txt"'
            return response

        except Exception as e:
            return Response({'error': str(e)}, status=500)
