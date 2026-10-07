import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { serializeData } from "../utils/serialize";


export async function getInstallationById(
  req: Request,
  res: Response
) {
  const installationId = Number(req.params.installationId);

  if (!Number.isInteger(installationId)) {
    return res.status(400).json({
      code: "INVALID_INSTALLATION_ID",
      message: "Installation ID must be an integer.",
      detail: "The installationId path parameter is invalid.",
    });
  }

  const installation = await prisma.solarInstallation.findUnique({
    where: {
      id: installationId,
    },
    include: {
      substation: {
        include: {
          district: {
            include: {
              province: true,
            },
          },
        },
      },
    },
  });

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No solar installation exists with ID ${installationId}.`,
    });
  }

  const data = serializeData(installation);

  const etag = `"${crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex")}"`;

  
  const lastModified = installation.updatedAt.toUTCString();


  res.setHeader("ETag", etag);
  res.setHeader("Last-Modified", lastModified);

  
  const requestEtag = req.headers["if-none-match"];

  if (requestEtag === etag) {
    return res.status(304).end();
  }

  const requestLastModified =
    req.headers["if-modified-since"];

  if (requestLastModified) {
    const requestDate = new Date(requestLastModified);
    const resourceDate = new Date(installation.updatedAt);

    if (
      !Number.isNaN(requestDate.getTime()) &&
      resourceDate <= requestDate
    ) {
      return res.status(304).end();
    }
  }

  return res.status(200).json(data);
}



export async function getLastKnownReading(
  req: Request,
  res: Response
) {
  const installationId = Number(req.params.installationId);

  if (!Number.isInteger(installationId)) {
    return res.status(400).json({
      code: "INVALID_INSTALLATION_ID",
      message: "Installation ID must be an integer.",
      detail: "The installationId path parameter is invalid.",
    });
  }

  const installation = await prisma.solarInstallation.findUnique({
    where: {
      id: installationId,
    },
  });

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No solar installation exists with ID ${installationId}.`,
    });
  }

  const reading = await prisma.generationReading.findFirst({
    where: {
      installationId,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  if (!reading) {
    return res.status(404).json({
      code: "READING_NOT_FOUND",
      message: "No generation reading found.",
      detail: `No generation reading exists for installation ${installationId}.`,
    });
  }

  return res.status(200).json(
    serializeData(reading)
  );
}



export async function getInstallationReadings(
  req: Request,
  res: Response
) {
  const installationId = Number(req.params.installationId);

  if (!Number.isInteger(installationId)) {
    return res.status(400).json({
      code: "INVALID_INSTALLATION_ID",
      message: "Installation ID must be an integer.",
      detail: "The installationId path parameter is invalid.",
    });
  }

  const installation = await prisma.solarInstallation.findUnique({
    where: {
      id: installationId,
    },
  });

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No solar installation exists with ID ${installationId}.`,
    });
  }


  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({
      code: "INVALID_PAGE",
      message: "Page must be a positive integer.",
      detail: "Use a value such as page=1.",
    });
  }

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      code: "INVALID_LIMIT",
      message: "Limit must be between 1 and 100.",
      detail: "Use a value such as limit=20.",
    });
  }


  const sort = String(req.query.sort ?? "timestamp");
  const order = String(req.query.order ?? "desc");

  if (sort !== "timestamp") {
    return res.status(400).json({
      code: "INVALID_SORT",
      message: "Invalid sort field.",
      detail: "Only timestamp sorting is supported.",
    });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({
      code: "INVALID_ORDER",
      message: "Invalid sort order.",
      detail: "Order must be either asc or desc.",
    });
  }

  const from =
    req.query.from !== undefined
      ? String(req.query.from)
      : undefined;

  const to =
    req.query.to !== undefined
      ? String(req.query.to)
      : undefined;

  let fromDate: Date | undefined;
  let toDate: Date | undefined;

  if (from) {
    fromDate = new Date(from);

    if (Number.isNaN(fromDate.getTime())) {
      return res.status(400).json({
        code: "INVALID_FROM_DATE",
        message: "Invalid from date.",
        detail: "Use a valid ISO 8601 date.",
      });
    }
  }

  if (to) {
    toDate = new Date(to);

    if (Number.isNaN(toDate.getTime())) {
      return res.status(400).json({
        code: "INVALID_TO_DATE",
        message: "Invalid to date.",
        detail: "Use a valid ISO 8601 date.",
      });
    }
  }

  if (fromDate && toDate && fromDate > toDate) {
    return res.status(400).json({
      code: "INVALID_TIME_RANGE",
      message: "Invalid time range.",
      detail:
        "The from date must be earlier than or equal to the to date.",
    });
  }

  
  const provinceId =
    req.query.provinceId !== undefined
      ? Number(req.query.provinceId)
      : undefined;

  const districtId =
    req.query.districtId !== undefined
      ? Number(req.query.districtId)
      : undefined;

  const substationId =
    req.query.substationId !== undefined
      ? Number(req.query.substationId)
      : undefined;

  if (
    provinceId !== undefined &&
    !Number.isInteger(provinceId)
  ) {
    return res.status(400).json({
      code: "INVALID_PROVINCE_ID",
      message: "Province ID must be an integer.",
      detail: "The provinceId query parameter is invalid.",
    });
  }

  if (
    districtId !== undefined &&
    !Number.isInteger(districtId)
  ) {
    return res.status(400).json({
      code: "INVALID_DISTRICT_ID",
      message: "District ID must be an integer.",
      detail: "The districtId query parameter is invalid.",
    });
  }

  if (
    substationId !== undefined &&
    !Number.isInteger(substationId)
  ) {
    return res.status(400).json({
      code: "INVALID_SUBSTATION_ID",
      message: "Substation ID must be an integer.",
      detail: "The substationId query parameter is invalid.",
    });
  }

  const where: any = {
    installationId,
  };

  if (fromDate || toDate) {
    where.timestamp = {};

    if (fromDate) {
      where.timestamp.gte = fromDate;
    }

    if (toDate) {
      where.timestamp.lte = toDate;
    }
  }

  if (provinceId !== undefined) {
    where.installation = {
      substation: {
        district: {
          provinceId,
        },
      },
    };
  }

  if (districtId !== undefined) {
    where.installation = {
      ...(where.installation ?? {}),
      substation: {
        ...(where.installation?.substation ?? {}),
        districtId,
      },
    };
  }

  if (substationId !== undefined) {
    where.installation = {
      ...(where.installation ?? {}),
      substationId,
    };
  }

 
  const skip = (page - 1) * limit;

  const [totalCount, readings] = await Promise.all([
    prisma.generationReading.count({
      where,
    }),

    prisma.generationReading.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        timestamp: order as "asc" | "desc",
      },
    }),
  ]);

  const totalPages =
    totalCount === 0
      ? 0
      : Math.ceil(totalCount / limit);

  const baseUrl =
    `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;

  const createUrl = (targetPage: number) => {
    const params = new URLSearchParams();

    params.set("page", String(targetPage));
    params.set("limit", String(limit));
    params.set("sort", sort);
    params.set("order", order);

    if (from) {
      params.set("from", from);
    }

    if (to) {
      params.set("to", to);
    }

    if (provinceId !== undefined) {
      params.set("provinceId", String(provinceId));
    }

    if (districtId !== undefined) {
      params.set("districtId", String(districtId));
    }

    if (substationId !== undefined) {
      params.set("substationId", String(substationId));
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const next =
    page < totalPages
      ? createUrl(page + 1)
      : null;

  const previous =
    page > 1
      ? createUrl(page - 1)
      : null;

  return res.status(200).json({
    page,
    limit,
    totalCount,
    totalPages,
    next,
    previous,
    items: serializeData(readings),
  });
}



export async function createGenerationReading(
  req: Request,
  res: Response
) {
  const installationId = Number(req.params.installationId);

  if (!Number.isInteger(installationId)) {
    return res.status(400).json({
      code: "INVALID_INSTALLATION_ID",
      message: "Installation ID must be an integer.",
      detail: "The installationId path parameter is invalid.",
    });
  }

  
  const installation =
    await prisma.solarInstallation.findUnique({
      where: {
        id: installationId,
      },
    });

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No solar installation exists with ID ${installationId}.`,
    });
  }

  const {
    timestamp,
    powerKw,
    cumulativeKwh,
    voltage,
  } = req.body;

  
  if (
    timestamp === undefined ||
    powerKw === undefined ||
    cumulativeKwh === undefined ||
    voltage === undefined
  ) {
    return res.status(400).json({
      code: "MISSING_READING_FIELDS",
      message: "Required reading fields are missing.",
      detail:
        "timestamp, powerKw, cumulativeKwh and voltage are required.",
    });
  }

  const readingTimestamp = new Date(timestamp);

  if (Number.isNaN(readingTimestamp.getTime())) {
    return res.status(400).json({
      code: "INVALID_TIMESTAMP",
      message: "Invalid timestamp.",
      detail: "Timestamp must be a valid ISO 8601 date.",
    });
  }


  const power = Number(powerKw);
  const cumulative = Number(cumulativeKwh);
  const voltageValue = Number(voltage);

  if (
    !Number.isFinite(power) ||
    !Number.isFinite(cumulative) ||
    !Number.isFinite(voltageValue)
  ) {
    return res.status(400).json({
      code: "INVALID_READING_VALUES",
      message: "Invalid reading values.",
      detail:
        "powerKw, cumulativeKwh and voltage must be valid numbers.",
    });
  }

  if (power < 0) {
    return res.status(400).json({
      code: "INVALID_POWER",
      message: "Power cannot be negative.",
      detail: "powerKw must be zero or greater.",
    });
  }

  if (cumulative < 0) {
    return res.status(400).json({
      code: "INVALID_CUMULATIVE_ENERGY",
      message: "Cumulative energy cannot be negative.",
      detail: "cumulativeKwh must be zero or greater.",
    });
  }

  if (voltageValue < 0) {
    return res.status(400).json({
      code: "INVALID_VOLTAGE",
      message: "Voltage cannot be negative.",
      detail: "voltage must be zero or greater.",
    });
  }


  try {
    const reading =
      await prisma.generationReading.create({
        data: {
          installationId,
          timestamp: readingTimestamp,
          powerKw: power,
          cumulativeKwh: cumulative,
          voltage: voltageValue,
        },
      });

    const location =
      `${req.protocol}://${req.get("host")}` +
      `/api/v1/installations/${installationId}/readings/${reading.id}`;

    return res
      .status(201)
      .location(location)
      .json(serializeData(reading));
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        code: "DUPLICATE_READING",
        message: "A reading already exists for this timestamp.",
        detail:
          "The same installation cannot have two readings with the same timestamp.",
      });
    }

    throw error;
  }
}