import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon,
  Building2,
  User,
  CreditCard,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface CompanySettings {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  gstNumber: string;
  panNumber: string;
}

interface TaxSettings {
  defaultTaxRate: number;
  taxInclusive: boolean;
  taxName: string;
  taxNumber: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  orderAlerts: boolean;
  systemAlerts: boolean;
  emailAddress: string;
}

interface SystemSettings {
  currency: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  autoBackup: boolean;
  backupFrequency: string;
  sessionTimeout: number;
}

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");
  const [isLoading, setIsLoading] = useState(false);

  // Validation errors state
  const [companyErrors, setCompanyErrors] = useState<{[key: string]: string}>({});
  const [taxErrors, setTaxErrors] = useState<{[key: string]: string}>({});
  const [notificationErrors, setNotificationErrors] = useState<{[key: string]: string}>({});
  const [systemErrors, setSystemErrors] = useState<{[key: string]: string}>({});

  // Company settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: "",
    email: "",
    website: "",
    gstNumber: "",
    panNumber: "",
  });

  // Tax settings
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    defaultTaxRate: 18,
    taxInclusive: false,
    taxName: "GST",
    taxNumber: "",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    lowStockAlerts: true,
    orderAlerts: true,
    systemAlerts: true,
    emailAddress: "",
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    language: "en",
    autoBackup: true,
    backupFrequency: "daily",
    sessionTimeout: 30,
  });

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedCompany = localStorage.getItem('company_settings');
      if (savedCompany) {
        setCompanySettings(JSON.parse(savedCompany));
      }

      const savedTax = localStorage.getItem('tax_settings');
      if (savedTax) {
        setTaxSettings(JSON.parse(savedTax));
      }

      const savedNotifications = localStorage.getItem('notification_settings');
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications));
      }

      const savedSystem = localStorage.getItem('system_settings');
      if (savedSystem) {
        setSystemSettings(JSON.parse(savedSystem));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return "Phone number is required";
    const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const validateWebsite = (website: string): string => {
    if (!website) return "";
    try {
      new URL(website);
      return "";
    } catch {
      return "Please enter a valid website URL";
    }
  };

  const validateGST = (gst: string): string => {
    if (!gst) return "";
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gst)) {
      return "Please enter a valid GST number (15 characters)";
    }
    return "";
  };

  const validatePAN = (pan: string): string => {
    if (!pan) return "";
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      return "Please enter a valid PAN number (10 characters)";
    }
    return "";
  };

  const validateTaxRate = (rate: number): string => {
    if (rate < 0 || rate > 100) {
      return "Tax rate must be between 0 and 100";
    }
    return "";
  };

  const validateSessionTimeout = (timeout: number): string => {
    if (timeout < 5 || timeout > 480) {
      return "Session timeout must be between 5 and 480 minutes";
    }
    return "";
  };

  const validateCompanySettings = (): boolean => {
    const errors: {[key: string]: string} = {};

    errors.name = !companySettings.name.trim() ? "Company name is required" : "";
    errors.email = validateEmail(companySettings.email);
    errors.phone = validatePhone(companySettings.phone);
    errors.website = validateWebsite(companySettings.website);
    errors.gstNumber = validateGST(companySettings.gstNumber);
    errors.panNumber = validatePAN(companySettings.panNumber);

    setCompanyErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const validateTaxSettings = (): boolean => {
    const errors: {[key: string]: string} = {};

    errors.defaultTaxRate = validateTaxRate(taxSettings.defaultTaxRate);
    if (taxSettings.taxName && !taxSettings.taxName.trim()) {
      errors.taxName = "Tax name cannot be empty if provided";
    }

    setTaxErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const validateNotificationSettings = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (notificationSettings.emailNotifications && notificationSettings.emailAddress) {
      errors.emailAddress = validateEmail(notificationSettings.emailAddress);
    }

    setNotificationErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const validateSystemSettings = (): boolean => {
    const errors: {[key: string]: string} = {};

    errors.sessionTimeout = validateSessionTimeout(systemSettings.sessionTimeout);

    setSystemErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const saveSettings = async (settingsType: string, settings: any) => {
    // Validate before saving
    let isValid = false;
    switch (settingsType) {
      case 'company':
        isValid = validateCompanySettings();
        break;
      case 'tax':
        isValid = validateTaxSettings();
        break;
      case 'notification':
        isValid = validateNotificationSettings();
        break;
      case 'system':
        isValid = validateSystemSettings();
        break;
      default:
        isValid = true;
    }

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem(`${settingsType}_settings`, JSON.stringify(settings));
      toast({
        title: "Settings Saved",
        description: `${settingsType} settings have been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = (settingsType: string) => {
    if (confirm(`Are you sure you want to reset ${settingsType} settings to default?`)) {
      // Reset to default values and clear validation errors
      switch (settingsType) {
        case 'company':
          setCompanySettings({
            name: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            country: "India",
            phone: "",
            email: "",
            website: "",
            gstNumber: "",
            panNumber: "",
          });
          setCompanyErrors({});
          break;
        case 'tax':
          setTaxSettings({
            defaultTaxRate: 18,
            taxInclusive: false,
            taxName: "GST",
            taxNumber: "",
          });
          setTaxErrors({});
          break;
        case 'notification':
          setNotificationSettings({
            emailNotifications: true,
            lowStockAlerts: true,
            orderAlerts: true,
            systemAlerts: true,
            emailAddress: "",
          });
          setNotificationErrors({});
          break;
        case 'system':
          setSystemSettings({
            currency: "INR",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "24h",
            language: "en",
            autoBackup: true,
            backupFrequency: "daily",
            sessionTimeout: 30,
          });
          setSystemErrors({});
          break;
      }
    }
  };

  // Helper component for error display
  const ErrorMessage = ({ error }: { error: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 text-sm text-destructive mt-1">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure your system settings, company information, and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Tax
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                    placeholder="Enter company name"
                    className={companyErrors.name ? "border-destructive" : ""}
                  />
                  <ErrorMessage error={companyErrors.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email *</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    placeholder="company@example.com"
                    className={companyErrors.email ? "border-destructive" : ""}
                  />
                  <ErrorMessage error={companyErrors.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone *</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className={companyErrors.phone ? "border-destructive" : ""}
                  />
                  <ErrorMessage error={companyErrors.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    placeholder="https://www.example.com"
                    className={companyErrors.website ? "border-destructive" : ""}
                  />
                  <ErrorMessage error={companyErrors.website} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={companySettings.gstNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, gstNumber: e.target.value })}
                    placeholder="22AAAAA0000A1Z5"
                    className={companyErrors.gstNumber ? "border-destructive" : ""}
                  />
                  <ErrorMessage error={companyErrors.gstNumber} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    value={companySettings.panNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, panNumber: e.target.value })}
                    placeholder="AAAAA0000A"
                    className={companyErrors.panNumber ? "border-destructive" : ""}
                  />
                  <ErrorMessage error={companyErrors.panNumber} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea
                  id="companyAddress"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  placeholder="Enter company address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={companySettings.city}
                    onChange={(e) => setCompanySettings({ ...companySettings, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={companySettings.state}
                    onChange={(e) => setCompanySettings({ ...companySettings, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={companySettings.zipCode}
                    onChange={(e) => setCompanySettings({ ...companySettings, zipCode: e.target.value })}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => resetSettings('company')}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={() => saveSettings('company', companySettings)}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Company Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Tax Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="taxName">Tax Name</Label>
                  <Input
                    id="taxName"
                    value={taxSettings.taxName}
                    onChange={(e) => setTaxSettings({ ...taxSettings, taxName: e.target.value })}
                    placeholder="GST, VAT, etc."
                    className={taxErrors.taxName ? "border-destructive" : ""}
                  />
                  <ErrorMessage error={taxErrors.taxName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="defaultTaxRate"
                    type="number"
                    value={taxSettings.defaultTaxRate}
                    onChange={(e) => setTaxSettings({ ...taxSettings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                    placeholder="18"
                    className={taxErrors.defaultTaxRate ? "border-destructive" : ""}
                  />
                  <ErrorMessage error={taxErrors.defaultTaxRate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Tax Number</Label>
                  <Input
                    id="taxNumber"
                    value={taxSettings.taxNumber}
                    onChange={(e) => setTaxSettings({ ...taxSettings, taxNumber: e.target.value })}
                    placeholder="Enter tax registration number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Inclusive Pricing</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={taxSettings.taxInclusive}
                      onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, taxInclusive: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {taxSettings.taxInclusive ? "Prices include tax" : "Tax added to prices"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => resetSettings('tax')}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={() => saveSettings('tax', taxSettings)}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Tax Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when inventory is low</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified for new orders</p>
                  </div>
                  <Switch
                    checked={notificationSettings.orderAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, orderAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified for system updates and maintenance</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemAlerts: checked })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email Address</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={notificationSettings.emailAddress}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAddress: e.target.value })}
                  placeholder="notifications@example.com"
                  className={notificationErrors.emailAddress ? "border-destructive" : ""}
                />
                <ErrorMessage error={notificationErrors.emailAddress} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => resetSettings('notification')}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={() => saveSettings('notification', notificationSettings)}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={systemSettings.currency}
                    onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={systemSettings.dateFormat}
                    onValueChange={(value) => setSystemSettings({ ...systemSettings, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={systemSettings.timeFormat}
                    onValueChange={(value) => setSystemSettings({ ...systemSettings, timeFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hour</SelectItem>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={systemSettings.language}
                    onValueChange={(value) => setSystemSettings({ ...systemSettings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={systemSettings.backupFrequency}
                    onValueChange={(value) => setSystemSettings({ ...systemSettings, backupFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) || 30 })}
                    placeholder="30"
                    className={systemErrors.sessionTimeout ? "border-destructive" : ""}
                  />
                  <ErrorMessage error={systemErrors.sessionTimeout} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">Enable automatic data backup</p>
                </div>
                <Switch
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => resetSettings('system')}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={() => saveSettings('system', systemSettings)}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
