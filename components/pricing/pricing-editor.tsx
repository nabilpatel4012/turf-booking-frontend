"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";

interface PricingRule {
  dayType?: "weekday" | "weekend";
  specificDate?: string;
  startTime: string;
  endTime: string;
  price: number;
  priority: number;
  name?: string;
}

interface PricingEditorProps {
  turfId: string;
}

export function PricingEditor({ turfId }: PricingEditorProps) {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New rule state
  const [newRule, setNewRule] = useState<PricingRule>({
    dayType: "weekday",
    startTime: "09:00",
    endTime: "18:00",
    price: 0,
    priority: 1,
    name: "",
  });
  const [ruleType, setRuleType] = useState<"standard" | "specific">("standard");

  useEffect(() => {
    fetchPricing();
  }, [turfId]);

  const fetchPricing = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/pricing?turfId=${turfId}`,
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pricing");
      }

      const data = await response.json();
      // Backend returns array of rules directly now based on our changes
      setRules(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching pricing:", error);
      toast.error("Failed to load pricing rules");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = () => {
    if (!newRule.startTime || !newRule.endTime || newRule.price < 0) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const ruleToAdd = { ...newRule };
    if (ruleType === "standard") {
      delete ruleToAdd.specificDate;
    } else {
      delete ruleToAdd.dayType;
      if (!ruleToAdd.specificDate) {
        toast.error("Please select a date");
        return;
      }
    }

    setRules([...rules, ruleToAdd]);
    // Reset form
    setNewRule({
      dayType: "weekday",
      startTime: "09:00",
      endTime: "18:00",
      price: 0,
      priority: 1,
      name: "",
    });
  };

  const handleDeleteRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const handleSave = async () => {
    // Check if user typed in the form but didn't click Add Rule
    if (newRule.price > 0 || newRule.startTime !== "09:00" || newRule.endTime !== "18:00") {
      toast.warning("You have unsaved details in the 'Add New Rule' form. Click 'Add Rule' first if you want to include it.");
      return;
    }

    if (rules.length === 0) {
      // Allow saving empty rules (clearing pricing), but ask for confirmation or just proceed?
      // The user complained about "not sending any payload", implying they WANTED to send something.
      // So if rules are empty, we should probably warn them unless they explicitly want to clear.
      // For now, let's just proceed but maybe show a message if it was unintentional?
      // Actually, let's just let it pass if they really want to clear, but the form check above handles the "forgot to add" case.
    }

    setSaving(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/pricing/admin/update`,
        {
          method: "POST",
          body: JSON.stringify({
            turfId,
            rules,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save pricing");
      }

      toast.success("Pricing updated successfully");
      fetchPricing(); // Refresh
    } catch (error: any) {
      console.error("Error saving pricing:", error);
      toast.error(error.message || "Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add New Rule Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rule Type</Label>
              <Select
                value={ruleType}
                onValueChange={(v: "standard" | "specific") => setRuleType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (Recurring)</SelectItem>
                  <SelectItem value="specific">Specific Date (Override)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {ruleType === "standard" ? (
              <div className="space-y-2">
                <Label>Day Type</Label>
                <Select
                  value={newRule.dayType}
                  onValueChange={(v: "weekday" | "weekend") =>
                    setNewRule({ ...newRule, dayType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekday">Weekday (Mon-Fri)</SelectItem>
                    <SelectItem value="weekend">Weekend (Sat-Sun)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newRule.specificDate || ""}
                  onChange={(e) =>
                    setNewRule({ ...newRule, specificDate: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={newRule.startTime}
                onChange={(e) =>
                  setNewRule({ ...newRule, startTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={newRule.endTime}
                onChange={(e) =>
                  setNewRule({ ...newRule, endTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input
                type="number"
                min="0"
                value={newRule.price}
                onChange={(e) =>
                  setNewRule({ ...newRule, price: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Input
                type="number"
                min="0"
                value={newRule.priority}
                onChange={(e) =>
                  setNewRule({ ...newRule, priority: Number(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Higher number = Higher priority
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Rule Name (Optional)</Label>
              <Input
                placeholder="e.g. Morning Rush, Christmas Special"
                value={newRule.name || ""}
                onChange={(e) =>
                  setNewRule({ ...newRule, name: e.target.value })
                }
              />
            </div>
          </div>

          <Button onClick={handleAddRule} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Rule
          </Button>
        </CardContent>
      </Card>

      {/* Existing Rules List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Pricing Rules</CardTitle>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pricing rules configured.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {rule.name || "-"}
                      </TableCell>
                      <TableCell>
                        {rule.specificDate ? (
                          <span className="text-blue-500 font-medium">
                            {new Date(rule.specificDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="capitalize">{rule.dayType}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {rule.startTime} - {rule.endTime}
                      </TableCell>
                      <TableCell>₹{rule.price}</TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => handleDeleteRule(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
