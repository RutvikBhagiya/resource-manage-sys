import { NextResponse } from "next/server"

type ApiResponse<T> = {
    success: boolean
    message: string
    data?: T
    error?: any
}

export function successResponse<T>(data: T, message: string = "Success", status: number = 200) {
    return NextResponse.json(
        {
            success: true,
            message,
            data,
        },
        { status }
    )
}

export function errorResponse(message: string, status: number = 500, error?: any) {
    // In development, we can return the raw error for debugging
    const isDev = process.env.NODE_ENV === "development"

    return NextResponse.json(
        {
            success: false,
            message,
            error: isDev ? error : undefined,
        },
        { status }
    )
}
