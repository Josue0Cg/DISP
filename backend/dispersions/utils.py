import re

def rellenarceros(valor, longitud):
    """Rellena con ceros a la izquierda hasta alcanzar la longitud."""
    return str(valor).zfill(longitud)

def rellenarespacios(valor, longitud, align='left'):
    """Rellena con espacios (izquierda o derecha) hasta alcanzar la longitud."""
    valor = str(valor)
    if len(valor) > longitud:
        return valor[:longitud]
    if align == 'left':
        return valor.ljust(longitud)
    else:
        return valor.rjust(longitud)

def format_amount(amount):
    """Multiplica por 100 y rellena a 18 dígitos."""
    # Assuming amount is a float or Decimal
    cents = int(round(float(amount) * 100))
    return rellenarceros(cents, 18)

def get_bank_key(account_number):
    """
    Extracts bank key from account number.
    Logic: 'agarra desde el segundo valor de la cuenta abono agarra los primero 4 digitos'
    Example: 00012076015642976363 -> 0012
    """
    if len(account_number) >= 5:
        return account_number[1:5]
    return "0000"

def validate_beneficiary(name):
    """
    Validates beneficiary name format: Name,AppPaterno/AppMaterno
    And strictly checks for special characters.
    """
    # Basic check, can be expanded based on strict rules
    # Allowed: A-Z, 0-9, spaces, comma, slash
    if not re.match(r'^[A-Z0-9\s,/]+$', name.upper()):
        return False
    return True

def generate_txt_content(header_data, charges_data, details_data):
    """
    Generates the content of the TXT file based on Layout D.
    """
    lines = []
    
    # --- Record Type 1 (Header) ---
    # Client Number (12), Date (6), Seq (4), Company (36), Desc (20), "15D", "01"
    line1 = (
        f"1"
        f"{rellenarceros(header_data['client_number'], 12)}"
        f"{header_data['payment_date']}"
        f"{rellenarceros(header_data['sequential'], 4)}"
        f"{rellenarespacios(header_data['company_name'], 36)}"
        f"{rellenarespacios(header_data['description'], 20)}"
        f"15D"
        f"01"
    )
    lines.append(line1)
    
    total_charges_amount = 0
    total_credits_amount = 0
    total_credits_count = 0
    
    # --- Record Type 2 (Charge) ---
    for charge in charges_data:
        # Op(1), Cur(001), Amount(18), AcctType(2), AcctNum(20), TotalMovs(6?) -> Requirement says TotalMovs is count of Type 3
        # Wait, the requirement says "Total de Movimientos" but doesn't specify length in Type 2 section clearly, 
        # but usually it matches the Total Record logic. Let's assume standard or infer from context.
        # Actually, looking at Type 4, counts are 6 digits.
        
        charge_amount_fmt = format_amount(charge['amount'])
        total_charges_amount += float(charge['amount'])
        
        # Count details for this charge
        details = [d for d in details_data if d['charge_index'] == charge['index']]
        details_count = len(details)
        total_credits_count += details_count
        
        line2 = (
            f"2"
            f"{header_data.get('operation_type', '1')}" # Op Type Cargo
            f"001" # Currency
            f"{charge_amount_fmt}"
            f"{rellenarceros(charge['account_type'], 2)}"
            f"{rellenarceros(charge['account_number'], 20)}" # Justified right with zeros left -> zfill
            f"{rellenarceros(details_count, 6)}" # Assuming 6 digits for count
        )
        lines.append(line2)
        
        # --- Record Type 3 (Detail) ---
        for detail in details:
            # Op(0), PayMethod(3), PayType(2), Cur(001), Amount(18), AcctType(2), AcctNum(20), 
            # PayRef(16), Beneficiary(55), Ref1-4(35*4), BankKey(4), Term(2), RFC(14), IVA(8), Instr(50)
            
            detail_amount_fmt = format_amount(detail['amount'])
            total_credits_amount += float(detail['amount'])
            
            bank_key = detail.get('bank_key')
            if not bank_key:
                bank_key = get_bank_key(detail['account_number'])
            
            line3 = (
                f"3"
                f"0" # Op Type Abono
                f"{rellenarceros(detail['payment_method'], 3)}"
                f"{rellenarceros(detail['payment_type'], 2)}"
                f"001" # Currency
                f"{detail_amount_fmt}"
                f"{rellenarceros(detail['account_type'], 2)}"
                f"{rellenarceros(detail['account_number'], 20)}"
                f"{rellenarespacios(detail['payment_reference'], 16)}"
                f"{rellenarespacios(detail['beneficiary'], 55)}"
                f"{rellenarespacios(detail.get('reference_1', ''), 35)}"
                f"{rellenarespacios(detail.get('reference_2', ''), 35)}"
                f"{rellenarespacios(detail.get('reference_3', ''), 35)}"
                f"{rellenarespacios(detail.get('reference_4', ''), 35)}"
                f"{rellenarceros(bank_key, 4)}"
                f"{rellenarceros(detail['term'], 2)}"
                f"{' ' * 14}" # RFC
                f"{' ' * 8}"  # IVA
                f"{rellenarespacios(detail.get('instructions', ''), 50)}"
            )
            lines.append(line3)

    # --- Record Type 4 (Total) ---
    # Cur(001), TotalCreds(6), TotalCredAmt(18), TotalCharges(6), TotalChargeAmt(18)
    line4 = (
        f"4"
        f"001"
        f"{rellenarceros(total_credits_count, 6)}"
        f"{format_amount(total_credits_amount)}"
        f"{rellenarceros(len(charges_data), 6)}"
        f"{format_amount(total_charges_amount)}"
    )
    lines.append(line4)
    
    return "\r\n".join(lines)
