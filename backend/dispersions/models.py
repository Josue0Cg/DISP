from django.db import models

class DispersionHeader(models.Model):
    """Record Type 1: Encabezado"""
    client_number = models.CharField(max_length=12)  # 12 digits, zfill
    payment_date = models.CharField(max_length=6)    # YYMMDD
    sequential = models.CharField(max_length=4)      # 4 digits, zfill
    company_name = models.CharField(max_length=36)   # 36 chars, ljust
    description = models.CharField(max_length=20)    # 20 chars, ljust
    # Fixed fields: nature="15D", charge_type="01"

    created_at = models.DateTimeField(auto_now_add=True)

class DispersionCharge(models.Model):
    """Record Type 2: Cargo"""
    header = models.ForeignKey(DispersionHeader, on_delete=models.CASCADE, related_name='charges')
    # Fixed: operation_type="1", currency="001"
    amount = models.DecimalField(max_digits=18, decimal_places=2) # Will be formatted as 18 digits * 100
    account_type = models.CharField(max_length=2)
    account_number = models.CharField(max_length=20) # 20 digits, zfill left
    total_movements = models.IntegerField() # Count of Type 3

class DispersionDetail(models.Model):
    """Record Type 3: Abono/Detalle"""
    charge = models.ForeignKey(DispersionCharge, on_delete=models.CASCADE, related_name='details')
    # Fixed: operation_type="0", currency="001"
    payment_method = models.CharField(max_length=3) # 001, 002, 003
    payment_type = models.CharField(max_length=2)   # 01, 51, etc.
    amount = models.DecimalField(max_digits=18, decimal_places=2)
    account_type = models.CharField(max_length=2)   # 01, 03, 04, 40
    account_number = models.CharField(max_length=20)
    payment_reference = models.CharField(max_length=16) # 16 chars, ljust
    beneficiary = models.CharField(max_length=55)       # Name,AppP/AppM
    reference_1 = models.CharField(max_length=35, blank=True)
    reference_2 = models.CharField(max_length=35, blank=True)
    reference_3 = models.CharField(max_length=35, blank=True)
    reference_4 = models.CharField(max_length=35, blank=True)
    bank_key = models.CharField(max_length=4) # 4 digits, zfill
    term = models.CharField(max_length=2)     # 00, 24
    instructions = models.CharField(max_length=50, blank=True)

class DispersionTotal(models.Model):
    """Record Type 4: Total"""
    header = models.ForeignKey(DispersionHeader, on_delete=models.CASCADE, related_name='totals')
    # Fixed: currency="001"
    total_credits = models.IntegerField() # Count of Type 3
    total_credit_amount = models.DecimalField(max_digits=18, decimal_places=2)
    total_charges = models.IntegerField() # Count of Type 2
    total_charge_amount = models.DecimalField(max_digits=18, decimal_places=2)
