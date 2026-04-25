import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/shared/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useCreateFeatureFlag } from '@/entities/flag';
import { FeatureFlagType } from '@/shared/types/entities';
import type { ProblemDetails } from '@/shared/types/auth';

const TYPE_OPTIONS = [
  {
    type: FeatureFlagType.Boolean,
    label: 'Boolean',
    description: 'On/Off flag',
  },
  {
    type: FeatureFlagType.String,
    label: 'String',
    description: 'Text value',
  },
  {
    type: FeatureFlagType.Number,
    label: 'Number',
    description: 'Numeric value',
  },
  {
    type: FeatureFlagType.Json,
    label: 'JSON',
    description: 'Object/array',
  },
] as const;

const createFeatureFlagSchema = z.object({
  type: z.number().int(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable(),
  key: z
      .string()
      .min(2, 'Key must be at least 2 character')
      .max(255, 'Key must not exceed 255 characters'),
});

type CreateFeatureFlagFormData = z.infer<typeof createFeatureFlagSchema>;

interface CreateFeatureFlagDialogProps {
  projectId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function CreateFeatureFlagDialog({
  projectId,
  open: controlledOpen,
  onOpenChange,
  children,
}: CreateFeatureFlagDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<FeatureFlagType | null>(null);
  const createFlag = useCreateFeatureFlag();

  const open = controlledOpen ?? internalOpen;

  const setOpen = (value: boolean) => {
    if (!value) {
      setStep(1);
      setSelectedType(null);
      form.reset();
    }
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const form = useForm<CreateFeatureFlagFormData>({
    resolver: zodResolver(createFeatureFlagSchema) as Resolver<CreateFeatureFlagFormData>,
    defaultValues: {
      type: FeatureFlagType.Boolean,
      name: '',
      description: '',
    },
  });

  const handleNextStep = () => {
    if (selectedType === null) return;
    form.setValue('type', selectedType);
    setStep(2);
  };

  const onSubmit = async (data: CreateFeatureFlagFormData) => {
    try {
      await createFlag.mutateAsync({
        projectId,
        data: {
          name: data.name,
          description: data.description || null,
          key: data.key,
          type: data.type as FeatureFlagType,
        },
      });
      toast.success('feature flag', 'created');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('feature flag', 'create', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New Feature Flag</DialogTitle>
              <DialogDescription>
                Choose the value type for this flag. Type cannot be changed after creation.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 py-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setSelectedType(opt.type)}
                  className={[
                    'flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors',
                    selectedType === opt.type
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50',
                  ].join(' ')}
                >
                  <span className="font-medium text-sm">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Type cannot be changed after creation.
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={selectedType === null}
              >
                Next
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create New Feature Flag</DialogTitle>
              <DialogDescription>
                Configure the name and key for this{' '}
                {TYPE_OPTIONS.find((o) => o.type === selectedType)?.label ?? ''} flag.
                The flag will be initialized as disabled in all scopes.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="New Dashboard" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this flag (2-255 characters).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alias</FormLabel>
                          <FormControl>
                            <Input
                                placeholder="newDashboard"
                                {...field}
                                value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>A key to access this flag (2-225 characters)</FormDescription>
                          <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enables the new redesigned dashboard"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of what this flag controls (max 1000 characters).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={createFlag.isPending}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={createFlag.isPending}>
                    {createFlag.isPending ? 'Creating...' : 'Create Flag'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
