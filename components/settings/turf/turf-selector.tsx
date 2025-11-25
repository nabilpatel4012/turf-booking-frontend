import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Turf } from "@/types/settings";

interface TurfSelectorProps {
  turfs: Turf[];
  selectedTurfId: string;
  onTurfChange: (turfId: string) => void;
  isLoading: boolean;
}

export default function TurfSelector({
  turfs,
  selectedTurfId,
  onTurfChange,
  isLoading,
}: TurfSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Turf</CardTitle>
        <CardDescription>Choose a turf to manage its settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedTurfId}
          onValueChange={onTurfChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Select a turf..." />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading turfs...
              </div>
            ) : (
              turfs.map((turf) => (
                <SelectItem key={turf.id} value={turf.id}>
                  {turf.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
